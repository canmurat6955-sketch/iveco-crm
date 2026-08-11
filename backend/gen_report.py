import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('contact_match_report.json', 'r', encoding='utf-8') as f:
    r = json.load(f)

# Dedupe by customer_id, keep highest score
best = {}
for m in r['matches']:
    cid = m['customer_id']
    if cid not in best or m['score'] > best[cid]['score']:
        best[cid] = m

all_matches = sorted(best.values(), key=lambda x: x['score'], reverse=True)

# Generate markdown report
lines = []
lines.append("# Rehber ↔ CRM Eşleştirme Raporu\n")
lines.append(f"- Rehber kişi sayısı: **{r['total_contacts']}**")
lines.append(f"- Telefonlu kişi: **{r['with_phone']}**")
lines.append(f"- Benzersiz CRM eşleşmesi: **{len(all_matches)}**")
lines.append(f"- CRM'e telefon atanan: **{r['updated']}**\n")

# Group by score bands
perfect = [m for m in all_matches if m['score'] >= 1.0]
high = [m for m in all_matches if 0.8 <= m['score'] < 1.0]
med_high = [m for m in all_matches if 0.7 <= m['score'] < 0.8]
med = [m for m in all_matches if 0.5 <= m['score'] < 0.7]
low = [m for m in all_matches if m['score'] < 0.5]

lines.append(f"## Skor Dağılımı")
lines.append(f"| Skor | Adet | Güven |")
lines.append(f"|------|------|-------|")
lines.append(f"| 1.00 | {len(perfect)} | Tam Eşleşme |")
lines.append(f"| 0.80-0.99 | {len(high)} | Yüksek |")
lines.append(f"| 0.70-0.79 | {len(med_high)} | Orta-Yüksek |")
lines.append(f"| 0.50-0.69 | {len(med)} | Orta |")
lines.append(f"| 0.30-0.49 | {len(low)} | Düşük |")
lines.append("")

# Perfect matches
if perfect:
    lines.append("## ✅ Tam Eşleşme (skor = 1.00)\n")
    lines.append("| # | CRM Firma | Rehber Kişi | Telefon |")
    lines.append("|---|-----------|-------------|---------|")
    for i, m in enumerate(perfect, 1):
        ph = m['phones'][0] if m['phones'] else '-'
        cn = m['contact_name'] or m.get('contact_org', '')
        lines.append(f"| {i} | {m['customer_name']} | {cn} | {ph} |")
    lines.append("")

# High confidence
if high:
    lines.append("## 🟡 Yüksek Güven (skor 0.80-0.99)\n")
    lines.append("| # | Skor | CRM Firma | Rehber Kişi | Telefon | Doğru? |")
    lines.append("|---|------|-----------|-------------|---------|--------|")
    for i, m in enumerate(high, 1):
        ph = m['phones'][0] if m['phones'] else '-'
        cn = m['contact_name'] or m.get('contact_org', '')
        lines.append(f"| {i} | {m['score']:.2f} | {m['customer_name']} | {cn} | {ph} | ? |")
    lines.append("")

# Medium-high
if med_high:
    lines.append("## ⚠️ Orta-Yüksek Güven (skor 0.70-0.79)\n")
    lines.append("| # | Skor | CRM Firma | Rehber Kişi | Telefon | Doğru? |")
    lines.append("|---|------|-----------|-------------|---------|--------|")
    for i, m in enumerate(med_high, 1):
        ph = m['phones'][0] if m['phones'] else '-'
        cn = m['contact_name'] or m.get('contact_org', '')
        lines.append(f"| {i} | {m['score']:.2f} | {m['customer_name']} | {cn} | {ph} | ? |")
    lines.append("")

# Medium
if med:
    lines.append("## 🔶 Orta Güven (skor 0.50-0.69)\n")
    lines.append("| # | Skor | CRM Firma | Rehber Kişi | Telefon |")
    lines.append("|---|------|-----------|-------------|---------|")
    for i, m in enumerate(med, 1):
        ph = m['phones'][0] if m['phones'] else '-'
        cn = m['contact_name'] or m.get('contact_org', '')
        lines.append(f"| {i} | {m['score']:.2f} | {m['customer_name']} | {cn} | {ph} |")
    lines.append("")

report = '\n'.join(lines)
with open('contact_review_report.md', 'w', encoding='utf-8') as f:
    f.write(report)

print(f"Rapor olusturuldu: contact_review_report.md")
print(f"Toplam benzersiz eslesmeler: {len(all_matches)}")
print(f"  Tam: {len(perfect)}, Yuksek: {len(high)}, Orta-Yuksek: {len(med_high)}, Orta: {len(med)}, Dusuk: {len(low)}")
