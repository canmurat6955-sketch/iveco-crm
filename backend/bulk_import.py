import sys,os,re,json
sys.path.insert(0,os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.crm.models import Customer

def fmt(p):
    if not p: return None
    p=re.sub(r'[^\d]','',p)
    if p.startswith('90') and len(p)==12: return f"0{p[2:5]} {p[5:8]} {p[8:10]} {p[10:]}"
    if len(p)==11 and p.startswith('0'): return f"0{p[1:4]} {p[4:7]} {p[7:9]} {p[9:]}"
    return p if len(p)>=7 else None

with open('bulk_import_data.json','r',encoding='utf-8') as f:
    data = json.load(f)

db = SessionLocal()
existing = {c.company_name.upper().strip() for c in db.query(Customer.company_name).all()}
added, skipped = 0, 0

for firm in data:
    name = firm['name'].strip()
    if name.upper() in existing:
        skipped += 1
        continue
    phone = fmt(firm.get('phone',''))
    notes = firm.get('source','')
    if firm.get('contact'): notes += f" | Yetkili: {firm['contact']}"
    if firm.get('addr'): notes += f" | Adres: {firm['addr']}"
    if firm.get('area'): notes += f" | Alan: {firm['area']}"

    c = Customer(
        company_name=name, phone=phone, city=firm.get('city','Bilinmiyor'),
        district=firm.get('district'), address=firm.get('addr'),
        sector=firm.get('sector','Diğer'), segment=firm.get('seg','C'),
        potential_level=firm.get('pot','medium'), potential_score=firm.get('score',50),
        source='manual_intel', sales_notes=notes, is_active=True)
    db.add(c)
    existing.add(name.upper())
    added += 1

db.commit()
total = db.query(Customer).count()
db.close()
print(f"TAMAMLANDI! Eklenen: {added} | Atlanan: {skipped} | CRM toplam: {total}")
