import os
import sys
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# App import yollarını ekleyelim
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base
from app.modules.auth.models import User
from app.modules.crm.models import Customer, CustomerContact, CustomerInteraction
from app.modules.discovery.models import DiscoverySource, DiscoveredCompany
from app.modules.sales_activity.models import SalesActivity, MessageTemplate, RoutePlan, RouteStop, Visit
from app.modules.notifications.models import Notification, NotificationPreference
from app.modules.campaigns.models import Campaign

def migrate(sqlite_path: str, pg_url: str):
    print(f"[*] SQLite kaynağı: {sqlite_path}")
    print(f"[*] PostgreSQL hedefi: {pg_url}")

    if not os.path.exists(sqlite_path):
        print(f"[!] HATA: SQLite veritabanı bulunamadı: {sqlite_path}")
        return

    # 1. Bağlantıları oluştur
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()

    pg_engine = create_engine(pg_url)
    
    # 2. PostgreSQL tablolarını temizle ve sıfırdan oluştur
    print("[*] PostgreSQL üzerinde eski tablolar temizleniyor...")
    Base.metadata.drop_all(bind=pg_engine)
    Base.metadata.create_all(bind=pg_engine)
    print("[+] Tablolar başarıyla sıfırdan oluşturuldu.")


    PgSession = sessionmaker(bind=pg_engine)
    pg_session = PgSession()

    try:
        # 3. Tabloları sırasıyla göç ettir (Foreign Key sıralamasına uygun)
        tables_to_migrate = [
            ("users", User, [
                "id", "email", "hashed_password", "full_name", "role", "is_active", "created_at"
            ]),
            ("discovery_sources", DiscoverySource, [
                "id", "name", "source_type", "url", "scraper_class", "is_active", 
                "last_run_at", "last_run_status", "last_run_count", "schedule_cron", "created_at"
            ]),
            ("campaigns", Campaign, [
                "id", "title", "description", "start_date", "end_date", "status", "category",
                "target_segment", "budget", "actual_cost", "created_at", "updated_at", "created_by_id"
            ]),
            ("customers", Customer, [
                "id", "company_name", "tax_number", "city", "district", "address", "phone", 
                "email", "website", "sector", "current_fleet", "estimated_fleet_size", 
                "previous_vehicles", "last_contact_date", "segment", "sales_notes", 
                "potential_level", "potential_score", "source", "pipeline_stage", 
                "pipeline_note", "is_active", "assigned_to_id", "created_at", "updated_at",
                "google_place_id", "latitude", "longitude", "google_maps_url", "google_formatted_address"
            ]),
            ("customer_contacts", CustomerContact, [
                "id", "customer_id", "contact_name", "role", "phone", "email", "notes", "is_primary"
            ]),
            ("discovered_companies", DiscoveredCompany, [
                "id", "source_id", "company_name", "city", "district", "sector", "phone", "website",
                "activity_description", "contact_info", "raw_data", "status", "matched_customer_id",
                "enrichment_score", "enrichment_details", "discovered_at", "processed_at"
            ]),
            ("message_templates", MessageTemplate, [
                "id", "name", "content", "category", "created_at"
            ]),
            ("sales_activities", SalesActivity, [
                "id", "customer_id", "user_id", "activity_type", "template_used", 
                "campaign_id", "message_content", "status", "notes", "next_follow_up", 
                "created_at", "updated_at"
            ]),
            ("customer_interactions", CustomerInteraction, [
                "id", "customer_id", "user_id", "interaction_type", "notes", 
                "next_action", "next_action_date", "created_at"
            ]),
            ("notifications", Notification, [
                "id", "user_id", "title", "message", "type", "is_read", "created_at", "action_url", "related_id"
            ]),
            ("notification_preferences", NotificationPreference, [
                "id", "user_id", "email_enabled", "push_enabled", "categories"
            ]),
            ("visits", Visit, [
                "id", "customer_id", "user_id", "started_at", "ended_at", "start_latitude", "start_longitude",
                "end_latitude", "end_longitude", "accuracy", "address", "notes", "outcome", "next_action", 
                "next_follow_up_date", "created_at"
            ]),
            ("route_plans", RoutePlan, [
                "id", "user_id", "name", "date", "created_at"
            ]),
            ("route_stops", RouteStop, [
                "id", "route_plan_id", "customer_id", "sequence_order", "visited", "visited_at"
            ])
        ]

        for table_name, model_class, columns in tables_to_migrate:
            print(f"[*] '{table_name}' tablosu göç ettiriliyor...")
            
            # SQLite'tan verileri oku
            sqlite_cursor.execute(f"SELECT * FROM {table_name}")
            rows = sqlite_cursor.fetchall()
            
            if not rows:
                print(f"[i] '{table_name}' tablosunda kayıt bulunamadı, atlanıyor.")
                continue

            count = 0
            for row in rows:
                # Modeli oluştur
                model_data = {}
                for col in columns:
                    # SQLite satırından değeri al (eğer kolonda varsa)
                    if col in row.keys():
                        val = row[col]
                        
                        # SQLite NULL source_type hatasını düzelt
                        if table_name == "discovery_sources" and col == "source_type" and val is None:
                            val = "website"
                            
                        model_data[col] = val

                instance = model_class(**model_data)
                pg_session.add(instance)
                count += 1
            
            pg_session.commit()
            print(f"[+] '{table_name}' tablosundan {count} kayıt başarıyla aktarıldı.")

        print("\n[+] TÜM VERİLER BAŞARIYLA BULUT POSTGRESQL VERİTABANINA AKTARILDI! 🎉")

    except Exception as e:
        pg_session.rollback()
        print(f"\n[!] GÖÇ SIRASINDA HATA OLUŞTU: {e}")
        import traceback
        traceback.print_exc()
    finally:
        pg_session.close()
        sqlite_conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Kullanım: python migrate_to_postgres.py <postgresql_url>")
        print("Örn: python migrate_to_postgres.py postgresql://user:pass@host:port/dbname")
        sys.exit(1)
        
    pg_url = sys.argv[1]
    sqlite_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "iveco_crm.db")
    migrate(sqlite_path, pg_url)
