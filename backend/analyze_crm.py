import sys,os
sys.path.insert(0,os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.crm.models import Customer
from sqlalchemy import func
db = SessionLocal()
total = db.query(Customer).count()
print('TOPLAM:', total)
print('\n--- SEHIR DAGILIMI ---')
for c,n in db.query(Customer.city, func.count()).group_by(Customer.city).order_by(func.count().desc()).all():
    print(f'  {c or "Bilinmiyor"}: {n}')
print('\n--- SEKTOR DAGILIMI ---')
for s,n in db.query(Customer.sector, func.count()).group_by(Customer.sector).order_by(func.count().desc()).limit(15).all():
    print(f'  {s or "Bilinmiyor"}: {n}')
print('\n--- SEGMENT DAGILIMI ---')
for s,n in db.query(Customer.segment, func.count()).group_by(Customer.segment).order_by(func.count().desc()).all():
    print(f'  Segment {s or "?"}: {n}')
print('\n--- KAYNAK DAGILIMI ---')
for s,n in db.query(Customer.source, func.count()).group_by(Customer.source).order_by(func.count().desc()).all():
    print(f'  {s or "Bilinmiyor"}: {n}')
print('\n--- VERI KALITESI ---')
wp = db.query(Customer).filter(Customer.phone != None, Customer.phone != '').count()
we = db.query(Customer).filter(Customer.email != None, Customer.email != '').count()
wa = db.query(Customer).filter(Customer.address != None, Customer.address != '').count()
print(f'  Telefonlu: {wp}/{total} (%{100*wp//total})')
print(f'  E-postali: {we}/{total} (%{100*we//total})')
print(f'  Adresli: {wa}/{total} (%{100*wa//total})')
db.close()
