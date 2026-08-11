"""
Çorum Ticaret Borsası 438 üye → IVECO CRM Import
Veri tarayıcı ile scrape edildi, JSON olarak işleniyor.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')

from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.crm.models import Customer

# ── NACE → Sektör Haritası ────────────────────────────────────
NACE_SEKTOR = {
    "01": "Gıda / Tarım",
    "10": "Gıda / Tarım",
    "11": "Gıda / Tarım",
    "46.2": "Gıda / Tarım",
    "46.3": "Gıda / Tarım",
    "46.38": "Gıda / Tarım",
    "47.2": "Gıda Perakende",
    "52": "Depolama / Lojistik",
    "46.83": "Orman Ürünleri / Mobilya",
    "46.85": "Gübre / Kimya",
    "46.24": "Deri / Tekstil",
}

def nace_to_sector(nace_code):
    if not nace_code:
        return "Ticaret (Genel)"
    for prefix_len in [5, 4, 3, 2]:
        prefix = nace_code[:prefix_len]
        if prefix in NACE_SEKTOR:
            return NACE_SEKTOR[prefix]
    return "Gıda / Tarım"  # Çorum TB ağırlıklı tarım/gıda

# ── Skor Hesaplama ────────────────────────────────────────────
IVECO_KEYWORDS = {
    30: ["nakliye", "nakliyat", "lojistik", "taşımacılık", "transport", "kargo", "depolama"],
    25: ["otomotiv", "araç", "tır", "kamyon", "motorlu araç", "traktör"],
    20: ["inşaat", "yapı", "beton", "çimento", "hafriyat", "taahhüt"],
    15: ["akaryakıt", "petrol", "benzin", "mazot", "lpg"],
    10: ["tarım", "orman", "un ", "yem ", "tahıl", "hayvan", "gübre", "tohum"],
    5:  ["metal", "demir", "çelik", "makine", "sanayi"],
}

def calc_score(name, nace_desc):
    score = 40
    lower = (name + " " + (nace_desc or "")).lower()
    for bonus, keywords in IVECO_KEYWORDS.items():
        if any(k in lower for k in keywords):
            score += bonus
            break
    return min(score, 100)


# ── JSON veri ──────────────────────────────────────────────────
# Tarayıcıdan çekilen 438 üye verisi
MEMBERS_JSON = """PLACEHOLDER"""


def main():
    print("=" * 60)
    print("  ÇORUM TİCARET BORSASI → IVECO CRM IMPORT")
    print("=" * 60)
    print()

    # JSON dosyasını oku
    json_path = os.path.join(os.path.dirname(__file__), "corum_members.json")
    with open(json_path, "r", encoding="utf-8") as f:
        members = json.load(f)

    print(f"[1/4] {len(members)} üye yüklendi")

    # Duplikasyonları temizle
    seen = set()
    unique = []
    for m in members:
        key = m["name"].upper().strip()
        if key not in seen and len(key) > 2:
            seen.add(key)
            unique.append(m)
    print(f"  -> {len(unique)} benzersiz üye")

    # Örnekler
    print(f"\n[2/4] İlk 10 üye:")
    for i, m in enumerate(unique[:10]):
        sector = nace_to_sector(m.get("naceCode", ""))
        score = calc_score(m["name"], m.get("naceDesc", ""))
        print(f"  {i+1:3d}. {m['name'][:55]:55s} | {sector[:20]:20s} | {score}")

    # CRM'e ekle
    print(f"\n[3/4] CRM'e ekleniyor...")
    db = SessionLocal()
    added = 0
    skipped = 0

    for m in unique:
        name = m["name"]
        nace_code = m.get("naceCode", "")
        nace_desc = m.get("naceDesc", "")
        sector = nace_to_sector(nace_code)
        score = calc_score(name, nace_desc)

        if score >= 80:
            segment, potential = "A", "very_high"
        elif score >= 65:
            segment, potential = "B", "high"
        elif score >= 50:
            segment, potential = "C", "medium"
        else:
            segment, potential = "D", "low"

        # Duplikasyon kontrolü
        existing = db.query(Customer).filter(Customer.company_name == name).first()
        if existing:
            skipped += 1
            continue

        notes = "Çorum Ticaret Borsası üyesi"
        if nace_code:
            notes += f" | NACE: {nace_code}"
        if nace_desc and nace_desc != "-":
            notes += f" | {nace_desc[:80]}"

        customer = Customer(
            company_name=name,
            city="Çorum",
            district="Merkez",
            sector=sector,
            segment=segment,
            potential_level=potential,
            potential_score=score,
            source="corum_tb",
            sales_notes=notes,
            is_active=True,
        )
        db.add(customer)
        added += 1

    db.commit()

    # Özet
    corum_count = db.query(Customer).filter(Customer.city == "Çorum").count()
    total_count = db.query(Customer).count()
    db.close()

    print(f"\n[4/4] TAMAMLANDI!")
    print(f"  -> Yeni eklenen: {added}")
    print(f"  -> Atlanan (zaten mevcut): {skipped}")
    print(f"  -> Çorum toplam: {corum_count}")
    print(f"  -> CRM toplam: {total_count}")
    print()


if __name__ == "__main__":
    main()
