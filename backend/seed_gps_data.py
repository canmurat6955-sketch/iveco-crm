import sqlite3
import random

CITY_COORDS = {
    "Samsun": (41.2582, 36.4385),   # Tekkeköy / OSB civarı
    "Sinop": (41.9892, 35.1950),    # Merkez / Sanayi
    "Çorum": (40.5284, 34.9080),    # Merkez
    "Ordu": (40.9862, 37.8797),     # Altınordu
    "Amasya": (40.6531, 35.8331),   # Merkez
    "Tokat": (40.3160, 36.5540),     # Merkez
    "Giresun": (40.9169, 38.3886)   # Merkez
}

def seed_gps():
    conn = sqlite3.connect('iveco_crm.db')
    cursor = conn.cursor()
    
    # Tüm aktif müşterileri çek
    cursor.execute("SELECT id, city, company_name FROM customers WHERE is_active=1")
    rows = cursor.fetchall()
    
    seeded_count = 0
    
    print("=== GPS VERİSİ YAZMA BAŞLANGICI ===")
    
    for cid, city, name in rows:
        if city in CITY_COORDS:
            base_lat, base_lon = CITY_COORDS[city]
            # Küçük rastgele sapmalar (+- 3-5 km civarı)
            lat = base_lat + random.uniform(-0.04, 0.04)
            lon = base_lon + random.uniform(-0.04, 0.04)
            
            cursor.execute(
                "UPDATE customers SET latitude=?, longitude=? WHERE id=?",
                (lat, lon, cid)
            )
            seeded_count += 1
            
            # İlk 10 tanesini yazdır
            if seeded_count <= 10:
                print(f"  {name} ({city}) -> Lat: {lat:.4f}, Lon: {lon:.4f}")
                
    conn.commit()
    conn.close()
    print(f"=== GPS VERİSİ YAZMA TAMAMLANDI: {seeded_count} Müşteriye konum eklendi. ===")

if __name__ == "__main__":
    seed_gps()
