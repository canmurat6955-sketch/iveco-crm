"""
Günlük otomatik veritabanı yedeği.
- SQLite online backup API kullanır (sistem çalışırken güvenli).
- backups/daily/ altında son 14 günü saklar.
Kullanım: py backup_db.py   (Windows Görev Zamanlayıcı ile günlük çalıştırılır)
"""
import os, sqlite3, datetime, glob

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, 'backend', 'iveco_crm.db')
OUT = os.path.join(BASE, 'backups', 'daily')
KEEP = 14

os.makedirs(OUT, exist_ok=True)
dst = os.path.join(OUT, f"iveco_crm_{datetime.date.today():%Y%m%d}.db")
src = sqlite3.connect(DB)
bk = sqlite3.connect(dst)
src.backup(bk)
bk.close(); src.close()
print("Yedek alındı:", dst)

files = sorted(glob.glob(os.path.join(OUT, 'iveco_crm_*.db')))
for old in files[:-KEEP]:
    os.remove(old)
    print("Eski yedek silindi:", old)
