import shutil
import os
from PIL import Image

src_path = r"C:\Users\Murat\.gemini\antigravity\brain\1e5e0c54-8add-48bd-bdd6-0d5930c46491\logo512_1786294997885.png"
dest_dir = r"C:\Users\Murat\.gemini\antigravity\scratch\iveco-crm\frontend\public"

os.makedirs(dest_dir, exist_ok=True)

# Copy 512
dest_512 = os.path.join(dest_dir, "logo512.png")
shutil.copy(src_path, dest_512)
print("logo512.png kopyalandı.")

# Resize to 192
try:
    img = Image.open(src_path)
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(os.path.join(dest_dir, "logo192.png"))
    print("logo192.png boyutlandırıldı ve kaydedildi.")
    
    # Save as favicon.ico
    img_favicon = img.resize((64, 64), Image.Resampling.LANCZOS)
    img_favicon.save(os.path.join(dest_dir, "favicon.ico"))
    print("favicon.ico boyutlandırıldı ve kaydedildi.")
except Exception as e:
    print("Boyutlandırma sırasında hata:", e)
    # Fallback to copy
    shutil.copy(src_path, os.path.join(dest_dir, "logo192.png"))
    shutil.copy(src_path, os.path.join(dest_dir, "favicon.ico"))
