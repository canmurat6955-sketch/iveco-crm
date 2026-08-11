import sqlite3

def run_visits_migration():
    conn = sqlite3.connect('iveco_crm.db')
    cursor = conn.cursor()
    
    print("=== VISITS TABLOSU MİGRASYONU ===")
    
    # 1. Visits Tablosunu Yarat
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        started_at DATETIME NOT NULL,
        ended_at DATETIME,
        start_latitude REAL,
        start_longitude REAL,
        end_latitude REAL,
        end_longitude REAL,
        accuracy REAL,
        address TEXT,
        notes TEXT,
        outcome TEXT,
        next_action TEXT,
        next_follow_up_date DATE,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    """
    try:
        cursor.execute(create_table_sql)
        print("  visits tablosu başarıyla oluşturuldu (veya zaten mevcuttu).")
    except Exception as e:
        print(f"  Tablo oluşturulurken hata: {e}")
        
    # 2. İndeksleri Oluştur
    indexes = [
        ("ix_visits_customer_id", "visits(customer_id)"),
        ("ix_visits_user_id", "visits(user_id)"),
        ("ix_visits_started_at", "visits(started_at)")
    ]
    
    for idx_name, idx_target in indexes:
        try:
            cursor.execute(f"CREATE INDEX IF NOT EXISTS {idx_name} ON {idx_target}")
            print(f"  {idx_name} indeksi oluşturuldu.")
        except Exception as e:
            print(f"  {idx_name} oluşturulurken hata: {e}")
            
    conn.commit()
    conn.close()
    print("=== VISITS MİGRASYONU TAMAMLANDI ===")

if __name__ == "__main__":
    run_visits_migration()
