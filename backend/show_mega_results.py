"""Mega match sonuçlarını görüntüle"""
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

r = json.load(open('mega_match_report.json', 'r', encoding='utf-8'))

print("=== TELEFON EŞLEŞMELERİ (ilk 20) ===")
for m in r['phone_matches_detail'][:20]:
    print(f"  {m['contact'][:35]:<35s} -> {m['customer'][:40]}")

print(f"\n=== YÜKSEK İSİM EŞLEŞMELERİ (ilk 30) ===")
for m in r['name_matches_high_detail'][:30]:
    common = ', '.join(str(c) for c in m.get('common', [])[:3])
    print(f"  [{m['score']:.2f}] {m['contact'][:30]:<30s} -> {m['customer'][:35]:<35s} | {common}")

print(f"\n=== EŞLEŞMEMİŞ FİRMA KİŞİLERİ ===")
for m in r.get('unmatched_firma', []):
    print(f"  {m['name'][:45]:<45s} | {m['phone']}")

print(f"\n=== ÖZET ===")
for k, v in r.items():
    if not isinstance(v, list):
        print(f"  {k}: {v}")
