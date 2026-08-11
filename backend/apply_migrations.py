import sqlite3

def run_migrations():
    conn = sqlite3.connect('iveco_crm.db')
    cursor = conn.cursor()
    
    # Mevcut kolonları al
    cursor.execute("PRAGMA table_info(customers)")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Eklenecek kolonlar listesi
    new_cols = [
        ("google_place_id", "TEXT"),
        ("google_formatted_address", "TEXT"),
        ("google_maps_url", "TEXT"),
        ("latitude", "REAL"),
        ("longitude", "REAL")
    ]
    
    print("=== MİGRASYON BAŞLANGICI ===")
    
    for col_name, col_type in new_cols:
        if col_name not in columns:
            try:
                cursor.execute(f"ALTER TABLE customers ADD COLUMN {col_name} {col_type}")
                print(f"  {col_name} kolonu başarıyla eklendi.")
            except Exception as e:
                print(f"  {col_name} eklenirken hata: {e}")
        else:
            print(f"  {col_name} kolonu zaten mevcut.")
            
    # Index ekleme
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_customers_google_place_id ON customers(google_place_id)")
        print("  google_place_id için index oluşturuldu.")
    except Exception as e:
        print(f"  Index oluşturulurken hata: {e}")
        
    conn.commit()
    conn.close()
    print("=== MİGRASYON TAMAMLANDI ===")

if __name__ == "__main__":
    run_migrations()
