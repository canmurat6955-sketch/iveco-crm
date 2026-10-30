"""
Tek seferlik demo/sahte veri temizliği (30.10.2026).

Kullanım:
  py scripts/wipe_demo_data.py --db local   --dry-run      # yerel SQLite, sadece listele
  py scripts/wipe_demo_data.py --db prod    --dry-run      # canlı Postgres, sadece listele
  py scripts/wipe_demo_data.py --db prod    --apply        # yedek al + tek işlemde sil
  (--include-suspects : Aksoy Ağır Nakliyat ve Öz Karadeniz Nakliyat'ı da siler)

Kayıtlar ID ile DEĞİL içerikle seçilir (canlı ve yerel ID'ler farklıdır).
Gerçek kullanıcı verilerine (kartvizit müşterileri, gerçek WhatsApp gönderimleri,
ziyaretler, teklifler, aşamalar) DOKUNULMAZ.
"""
import argparse, json, pathlib, sys, datetime as dt
from sqlalchemy import create_engine, text

sys.stdout.reconfigure(encoding="utf-8")
BACKEND = pathlib.Path(__file__).resolve().parent.parent

ap = argparse.ArgumentParser()
ap.add_argument("--db", choices=["local", "prod"], required=True)
g = ap.add_mutually_exclusive_group(required=True)
g.add_argument("--dry-run", action="store_true")
g.add_argument("--apply", action="store_true")
ap.add_argument("--include-suspects", action="store_true")
args = ap.parse_args()

if args.db == "prod":
    url = (BACKEND / ".env.prod.local").read_text().strip().split("=", 1)[1]
else:
    url = f"sqlite:///{(BACKEND / 'iveco_crm.db').as_posix()}"
engine = create_engine(url)

CAMPAIGN_TEMPLATE = "Daily Şasi 6 Ay Ödemesiz Bayi Katkılı Kampanyası"
FAKE_PLATES = ("55 ABC 421", "55 AZ 882", "55 DF 109", "55 KL 603", "55 FR 310")
FAKE_CHASSIS = ("ZCF35C16SAMSUN01", "ZCF150E21CORUM02")
UNVERIFIED_TAG = "⚠️ DOĞRULANMADI: Firma bilgileri yapay zekâ aramasıyla bulundu, aramadan önce telefonu teyit edin."

fake_customer_where = (
    "(source = 'whatsapp_campaign' AND phone LIKE '% 555 %')"
    " OR (source = 'whatsapp_status_finder' AND company_name = 'Test Firma')"
    " OR (source = 'google_search_intent')"
)
if args.include_suspects:
    fake_customer_where += " OR phone IN ('0532 555 66 77', '05448887766', '0544 888 77 66')"

backup, report = {}, []

def rows(conn, sql, **p):
    return [dict(r._mapping) for r in conn.execute(text(sql), p)]

def ids_in(ids):
    return "(" + ",".join(str(int(i)) for i in ids) + ")" if ids else "(NULL)"

def delete(conn, table, where, label):
    found = rows(conn, f"SELECT * FROM {table} WHERE {where}")
    if found:
        backup.setdefault(table, []).extend(found)
        report.append((label, table, len(found)))
        if args.apply:
            conn.execute(text(f"DELETE FROM {table} WHERE {where}"))
    return found

def update(conn, table, set_sql, where, label):
    found = rows(conn, f"SELECT * FROM {table} WHERE {where}")
    if found:
        backup.setdefault(f"{table}__before_update", []).extend(found)
        report.append((label, table, len(found)))
        if args.apply:
            conn.execute(text(f"UPDATE {table} SET {set_sql} WHERE {where}"))
    return found

with engine.begin() as conn:  # tek işlem: hata olursa hiçbir şey silinmez
    # ── 1. Tamamen sahte müşteriler ve tüm bağlı kayıtları ──────────────
    fakes = rows(conn, f"SELECT id, company_name, phone, source FROM customers WHERE {fake_customer_where}")
    fid = ids_in([f["id"] for f in fakes])
    tr = rows(conn, f"SELECT id FROM proposal_trackings WHERE customer_id IN {fid}")
    delete(conn, "proposal_view_events", f"tracking_id IN {ids_in([t['id'] for t in tr])}", "Sahte müşteri bağlı")
    for t in ["proposal_trackings", "proforma_invoices", "sales_activities", "whatsapp_messages", "call_logs",
              "customer_interactions", "customer_vehicle_interests", "customer_fleet_vehicles",
              "customer_reminders", "customer_trade_ins", "customer_attachments", "route_stops", "visits"]:
        delete(conn, t, f"customer_id IN {fid}", "Sahte müşteri bağlı")
    delete(conn, "customer_contacts", f"customer_id IN {fid}", "Sahte müşteri bağlı")
    for t, col in [("discovered_companies", "matched_customer_id"), ("new_company_registrations", "matched_customer_id"),
                   ("tenders", "matched_customer_id"), ("web_intent_signals", "matched_customer_id"),
                   ("bodybuilder_referrals", "crm_customer_id"), ("personal_contacts", "converted_customer_id")]:
        update(conn, t, f"{col} = NULL", f"{col} IN {fid}", "Bağlantı koparıldı (kayıt korunur)")
    delete(conn, "customers", f"id IN {fid}", "SAHTE MÜŞTERİ")

    # ── 2. Gerçek telefonlu 4 kampanya firmasındaki sahte geçmiş ────────
    camp = rows(conn, "SELECT id FROM customers WHERE source = 'whatsapp_campaign'")
    cid = ids_in([c["id"] for c in camp])
    delete(conn, "sales_activities", "template_used = :t".replace(":t", "'" + CAMPAIGN_TEMPLATE + "'"), "Sahte kampanya geçmişi")
    delete(conn, "whatsapp_messages", "source = 'web_companion' AND media_url = '/campaigns/kuveyt_turk_daily_6ay.png'", "Sahte kampanya geçmişi")
    delete(conn, "customer_interactions", "notes LIKE 'Daily Şasi Kuveyt Türk 6 Ay Ödemesiz Kampanyası iletildi%'", "Sahte kampanya geçmişi")
    delete(conn, "customer_vehicle_interests", "customer_note LIKE 'Kuveyt Türk 6 Ay Ödemesiz Bayi Katkılı Kampanyası iletildi%'", "Sahte kampanya geçmişi")
    delete(conn, "customer_contacts", f"customer_id IN {cid}", "Uydurma yetkili adı (Kılıç Bey vb.)")
    update(conn, "customers",
           "pipeline_stage = NULL, pipeline_note = NULL, segment = NULL, potential_level = NULL, potential_score = 0, last_contact_date = NULL",
           f"id IN {cid}", "Kampanya firması aşaması sıfırlandı (müşteri korunur)")

    # ── 3. Tamamen uydurma tablolar / kayıtlar ──────────────────────────
    delete(conn, "customer_fleet_vehicles", "plate_number IN " + str(FAKE_PLATES), "Sahte filo aracı")
    delete(conn, "vehicle_stock", "chassis_no IN " + str(FAKE_CHASSIS), "Sahte stok şasisi")
    delete(conn, "web_intent_signals", "1=1", "Uydurma web niyet sinyali")
    delete(conn, "bodybuilder_referrals", "1=1", "Uydurma kasacı yönlendirmesi")
    delete(conn, "bodybuilder_partners", "1=1", "Uydurma kasacı")
    delete(conn, "tenders", "1=1", "Uydurma ihale")
    delete(conn, "new_company_registrations", "1=1", "Uydurma yeni şirket kaydı")
    delete(conn, "discovered_companies", "1=1", "Demo scraper keşfi")
    delete(conn, "discovery_sources", "1=1", "Demo keşif kaynağı")
    delete(conn, "notifications", "1=1", "Bildirim")

    # ── 4. Deneme proformalar (yalnızca bilinen deneme kaydı) ────────────
    pf = rows(conn, "SELECT id FROM proforma_invoices WHERE invoice_number = 'ERC-2026-0001' AND vehicle_model LIKE '%Daily 35C16%'")
    pfid = ids_in([p["id"] for p in pf])
    tr2 = rows(conn, f"SELECT id FROM proposal_trackings WHERE proforma_id IN {pfid}")
    delete(conn, "proposal_view_events", f"tracking_id IN {ids_in([t['id'] for t in tr2])}", "Deneme proforma bağlı")
    delete(conn, "proposal_trackings", f"proforma_id IN {pfid}", "Deneme proforma bağlı")
    delete(conn, "proforma_invoices", f"id IN {pfid}", "DENEME PROFORMA")

    # ── 5. Yapay zekâ firmaları: kalsın ama etiketlensin, uydurma puanlar sıfırlansın ──
    update(conn, "customers",
           f"sales_notes = '{UNVERIFIED_TAG} ' || REPLACE(COALESCE(sales_notes, ''), ' Google AI / Bölgesel Sanayi Odası onaylı öne çıkan firma.', ''),"
           " segment = NULL, potential_level = NULL, potential_score = 0",
           f"source = 'google_ai_intelligence' AND COALESCE(sales_notes, '') NOT LIKE '{UNVERIFIED_TAG[:15]}%'",
           "Yapay zekâ firması etiketlendi (müşteri korunur)")

    # ── Rapor ───────────────────────────────────────────────────────────
    mode = "UYGULANDI" if args.apply else "DENEME (hiçbir şey silinmedi)"
    print(f"\n===== {args.db.upper()} | {mode} =====")
    print("\nSilinecek sahte müşteriler:")
    for f in fakes:
        print(f"   - {f['company_name']}  ({f['phone']}, {f['source']})")
    print("\nİşlem özeti:")
    for label, table, n in report:
        print(f"   {n:>5}  {table:28s} {label}")

    if args.apply:
        out = BACKEND / "backups" / f"wipe_{args.db}_{dt.datetime.now():%Y%m%d_%H%M%S}.json"
        out.parent.mkdir(exist_ok=True)
        out.write_text(json.dumps(backup, ensure_ascii=False, default=str, indent=1), encoding="utf-8")
        print(f"\nYedek: {out}  ({sum(len(v) for v in backup.values())} satır)")
