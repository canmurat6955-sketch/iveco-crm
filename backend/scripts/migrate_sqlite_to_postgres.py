"""
Yerel SQLite veritabanını (backend/iveco_crm.db) PostgreSQL'e (Supabase) taşır.

Kullanım (backend klasöründen):
    py scripts/migrate_sqlite_to_postgres.py "postgresql://postgres.xxxx:SIFRE@aws-0-....pooler.supabase.com:5432/postgres"

- Hedefte tabloları oluşturur ve tr_norm fonksiyonunu kurar.
- Hedef tablolar boş değilse durur (üzerine yazmaz). Zorlamak için: --truncate
- Tabloları foreign-key sırasına göre kopyalar, ardından ID sayaçlarını (sequence) günceller.
- Sonunda kaynak/hedef satır sayılarını karşılaştırır.
"""
import os
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))
sys.stdout.reconfigure(encoding="utf-8")

if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(1)

target_url = sys.argv[1].strip()
if target_url.startswith("postgres://"):
    target_url = "postgresql://" + target_url[len("postgres://"):]
truncate = "--truncate" in sys.argv

# Uygulamanın kendi motoru yerel SQLite'a bağlansın (kaynak)
os.environ["DATABASE_URL"] = f"sqlite:///{(BACKEND / 'iveco_crm.db').as_posix()}"

from sqlalchemy import create_engine, text, inspect, Boolean  # noqa: E402
from app.core.database import Base, import_all_models, PG_TR_NORM_SQL, engine as src_engine  # noqa: E402

import_all_models()
dst_engine = create_engine(target_url, connect_args={"connect_timeout": 15})

print("[1/4] Hedef bağlantı testi…")
with dst_engine.connect() as c:
    print("      ", c.execute(text("select version()")).scalar()[:60])

print("[2/4] Tablolar ve tr_norm fonksiyonu hazırlanıyor…")
if truncate:
    print("      --truncate belirtildi: Eski tablolar temizleniyor...")
    with dst_engine.begin() as c:
        for t in reversed(Base.metadata.sorted_tables):
            c.execute(text(f'DROP TABLE IF EXISTS "{t.name}" CASCADE'))

Base.metadata.create_all(bind=dst_engine)
with dst_engine.begin() as c:
    c.execute(text(PG_TR_NORM_SQL))

tables = Base.metadata.sorted_tables  # FK bağımlılık sırası
src_tables = set(inspect(src_engine).get_table_names())

if not truncate:
    with dst_engine.connect() as c:
        non_empty = [t.name for t in tables if c.execute(text(f'select count(*) from "{t.name}"')).scalar()]
    if non_empty:
        print(f"[!] Hedefte dolu tablolar var: {non_empty}\n    Üzerine yazmamak için durdum. Bilerek silmek için --truncate ekleyin.")
        sys.exit(2)

print("[3/4] Veri kopyalanıyor…")
report = []
with src_engine.connect() as s, dst_engine.begin() as d:
    for t in tables:
        if t.name not in src_tables:
            report.append((t.name, 0, 0, "kaynakta yok"))
            continue
        src_cols = {col["name"] for col in inspect(src_engine).get_columns(t.name)}
        cols = [col for col in t.columns if col.name in src_cols]
        rows = s.execute(t.select().with_only_columns(*cols)).mappings().all()
        bool_cols = [col.name for col in cols if isinstance(col.type, Boolean)]
        clean = []
        for r in rows:
            row = dict(r)
            for name in bool_cols:  # SQLite 0/1 → Postgres true/false
                if row.get(name) is not None:
                    row[name] = bool(row[name])
            clean.append(row)
        BATCH = 500
        for i in range(0, len(clean), BATCH):
            d.execute(t.insert(), clean[i:i + BATCH])
        report.append((t.name, len(rows), None, ""))
        print(f"      {t.name:32s} {len(rows):6d}")

    # ID sayaçlarını en büyük ID'ye ayarla (yoksa yeni kayıt eklerken çakışma olur)
    for t in tables:
        if "id" in t.columns and t.columns["id"].autoincrement is not False:
            d.execute(text(
                f"SELECT setval(pg_get_serial_sequence('\"{t.name}\"', 'id'), "
                f"COALESCE((SELECT MAX(id) FROM \"{t.name}\"), 0) + 1, false)"
            ))

print("[4/4] Doğrulama (kaynak / hedef satır sayısı)…")
ok = True
with src_engine.connect() as s, dst_engine.connect() as d:
    for t in tables:
        if t.name not in src_tables:
            continue
        a = s.execute(text(f'select count(*) from "{t.name}"')).scalar()
        b = d.execute(text(f'select count(*) from "{t.name}"')).scalar()
        flag = "✓" if a == b else "✗"
        ok &= a == b
        if a or b:
            print(f"      {flag} {t.name:32s} {a:6d} → {b:6d}")
    print("      tr_norm testi:", d.execute(text("select tr_norm('ÇORUM Gıda Şirketi')")).scalar())

print("\nTAMAM ✓ Tüm tablolar eşleşti." if ok else "\n[!] Bazı tablolarda sayı tutmadı, yukarıya bakın.")
sys.exit(0 if ok else 3)
