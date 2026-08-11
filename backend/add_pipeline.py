import sqlite3
conn = sqlite3.connect('iveco_crm.db')
try:
    conn.execute("ALTER TABLE customers ADD COLUMN pipeline_stage VARCHAR(30) DEFAULT 'lead'")
except Exception as e:
    print('stage:', e)
try:
    conn.execute("ALTER TABLE customers ADD COLUMN pipeline_note TEXT")
except Exception as e:
    print('note:', e)
conn.commit()
conn.close()
print('OK')
