import json, sys
sys.stdout.reconfigure(encoding='utf-8')
with open('contact_match_report.json', 'r', encoding='utf-8') as f:
    r = json.load(f)

print("=== YÜKSEK GÜVEN EŞLEŞMELERİ (skor >= 0.50) ===\n")
count = 0
for m in r['matches']:
    if m['score'] >= 0.5:
        count += 1
        ph = m['phones'][0] if m['phones'] else '-'
        cname = m['customer_name'][:50].ljust(50)
        contact = (m['contact_name'] or m.get('contact_org', ''))[:30]
        print(f"  [{m['score']:.2f}] {cname} <- {contact:30s} | {ph}")
        if count >= 40:
            break

print(f"\nToplam yüksek güven: {len([m for m in r['matches'] if m['score'] >= 0.5])}")
print(f"Toplam eşleşme: {r['matched']}")
print(f"Güncellenen: {r['updated']}")
