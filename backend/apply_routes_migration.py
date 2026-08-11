import sqlite3

def run_routes_migration():
    conn = sqlite3.connect('iveco_crm.db')
    cursor = conn.cursor()
    
    print("=== ROTA PLANLAYICI MİGRASYONU ===")
    
    # 1. route_plans tablosu
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS route_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        date DATE NOT NULL,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    """)
    print("  route_plans tablosu oluşturuldu.")
    
    # 2. route_stops tablosu
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS route_stops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_plan_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        sequence_order INTEGER NOT NULL,
        visited BOOLEAN DEFAULT 0,
        visited_at DATETIME,
        FOREIGN KEY (route_plan_id) REFERENCES route_plans (id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    );
    """)
    print("  route_stops tablosu oluşturuldu.")
    
    # İndeksler
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_route_plans_user_id ON route_plans(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_route_stops_plan_id ON route_stops(route_plan_id)")
    
    conn.commit()
    conn.close()
    print("=== ROTA PLANLAYICI MİGRASYONU TAMAMLANDI ===")

if __name__ == "__main__":
    run_routes_migration()
