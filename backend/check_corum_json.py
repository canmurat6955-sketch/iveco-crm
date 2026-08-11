import json, sys
sys.stdout.reconfigure(encoding='utf-8')
with open('corum_members.json','r',encoding='utf-8') as f:
    data=json.load(f)
print(f'Toplam kayit: {len(data)}')
print('Ilk 5:')
for m in data[:5]:
    print(f'  {m["name"][:70]}')
print('Son 5:')
for m in data[-5:]:
    print(f'  {m["name"][:70]}')

# NACE kodu olanlar
with_nace = [m for m in data if m.get('naceCode')]
print(f'\nNACE kodu olan: {len(with_nace)}')
print(f'NACE kodu olmayan: {len(data) - len(with_nace)}')

# Sayfa 0 ilk 4 kayit menü olabilir
print('\nSayfa 0 kayitlari (muhtemelen menu):')
for m in data[:4]:
    print(f'  [{m["name"][:60]}]')
