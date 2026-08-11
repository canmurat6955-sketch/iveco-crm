import sys
sys.stdout.reconfigure(encoding='utf-8')
import pdfplumber

pdf_path = r"C:\Users\Murat\Downloads\ordu ihracatçı firmalar.pdf"
pdf = pdfplumber.open(pdf_path)

print(f"Toplam sayfa: {len(pdf.pages)}")
print()

# İlk 5 sayfa ham metin
for i, page in enumerate(pdf.pages[:5]):
    text = page.extract_text()
    if text:
        print(f"{'='*80}")
        print(f"SAYFA {i+1}")
        print(f"{'='*80}")
        lines = text.strip().split('\n')
        for j, line in enumerate(lines):
            print(f"  L{j:03d}: {line}")
        print()

# Tablolar var mı kontrol et
print("\n" + "="*80)
print("TABLO KONTROLU (ilk 3 sayfa)")
print("="*80)
for i, page in enumerate(pdf.pages[:3]):
    tables = page.extract_tables()
    if tables:
        print(f"\nSayfa {i+1}: {len(tables)} tablo bulundu")
        for ti, table in enumerate(tables):
            print(f"  Tablo {ti+1}: {len(table)} satir, {len(table[0]) if table else 0} sutun")
            for row in table[:5]:
                print(f"    {row}")
    else:
        print(f"Sayfa {i+1}: Tablo yok")

pdf.close()
