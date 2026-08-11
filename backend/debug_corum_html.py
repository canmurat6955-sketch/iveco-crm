import sys, requests
sys.stdout.reconfigure(encoding='utf-8')
from bs4 import BeautifulSoup

url = "https://www.corumtb.org.tr/TradeMembers?q=&group=&type=&nace=&page=0"
resp = requests.get(url, timeout=15, headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
})
resp.encoding = 'utf-8'
soup = BeautifulSoup(resp.text, 'html.parser')

# Tablo var mı?
tables = soup.find_all('table')
print(f"Tablo sayisi: {len(tables)}")

# Member kartları veya list items
cards = soup.select('.member-card, .member-item, .trade-member, .card')
print(f"Kart/card sayisi: {len(cards)}")

# Tüm div class'ları listele
divs_with_class = set()
for div in soup.find_all(['div', 'article', 'section'], class_=True):
    for cls in div.get('class', []):
        divs_with_class.add(cls)

print(f"\nTum class'lar ({len(divs_with_class)}):")
for cls in sorted(divs_with_class):
    print(f"  {cls}")

# Body altindaki ana content'i bul
main = soup.find('main') or soup.find('div', class_='content') or soup.find('div', id='content')
if main:
    print(f"\nMain element: {main.name}, class={main.get('class')}")
    # Alt elemanları listele
    for child in main.children:
        if hasattr(child, 'name') and child.name:
            print(f"  {child.name} class={child.get('class', '')[:50]}")

# HTML'in belirli kısmını yazdır - üye listesi bölümü
print("\n\n=== HTML SNIPPET (member bolgesi) ===")
# "438 kayıtlı" metnini bul
marker = soup.find(string=lambda t: t and '438' in str(t))
if marker:
    parent = marker.find_parent('div')
    if parent:
        # Sonraki kardeşleri göster
        for sib in parent.find_next_siblings()[:3]:
            print(str(sib)[:500])
            print("---")

# Alternatif: Tüm strong etiketlerini bul
print("\n=== TÜM STRONG ETİKETLERİ ===")
strongs = soup.find_all('strong')
for s in strongs[:30]:
    text = s.get_text(strip=True)
    if text and len(text) > 5:
        print(f"  {text[:80]}")
