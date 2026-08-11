import sqlite3
import os
import re

DB = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
conn = sqlite3.connect(DB)
c = conn.cursor()

def turkish_lower(t):
    return t.replace('İ','i').replace('I','ı').replace('Ö','ö').replace('Ü','ü').replace('Ş','ş').replace('Ç','ç').replace('Ğ','ğ').lower()

def normalize_name(name):
    n = turkish_lower(name.strip())
    for suffix in [' limited şirketi', ' ltd şti', ' ltd. şti.', ' ltd.şti.', ' san. ve tic.', 
                   ' san.ve tic.', ' sanayi ve ticaret', ' san. tic.', ' san.tic.',
                   ' anonim şirketi', ' a.ş.', ' a.ş', ' ltd', ' limited',
                   ' ithalat ihracat', ' ithalat', ' ihracat', ' ith. ihr.',
                   ' imalat', ' üretim', ' pazarlama', ' hizmetleri',
                   ' ticaret', ' sanayi', ' san.', ' tic.']:
        n = n.replace(suffix, '')
    n = re.sub(r'[^\w\s]', '', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

STOPS = {
    'sanayi','ticaret','limited','şirketi','anonim','ithalat','ihracat','ith','ihr',
    'imalat','üretim','pazarlama','hizmetleri','malzemeleri','maddeleri',
    'ürünleri','sistemleri','taşımacılık','müh','gıda','inşaat','tekstil','ltd','sti','şti',
    'veya','grup','beyi','hanim','yeri','naks','nak','subesi','şubesi','şube','sube',
    'serbest','bölgesi','bolgesi','ortakligi','ortaklığı',
    
    'nakliye','nakliyat','lojistik','tasimacilik','taşımacılık','otomotiv','oto','motor',
    'galeri','un','irmik','tarim','tarım','petrol','beton','hazir','hazır','kum','cakil',
    'çakıl','madencilik','mermer','insaat','inşaat','taahhut','taahhüt','turizm',
    'giyim','ayakkabi','deri','mobilya','mobilyaci','mobilyacı','ahsap','ahşap','kagit',
    'kağıt','ambalaj','koli','plastik','kaucuk','kauçuk','kimya','ilac','ilaç','metal',
    'demir','celik','çelik','dokum','döküm','makina','makine','techizat','teçhizat',
    'elektrik','elektronik','aydinlatma','aydınlatma','kablo','enerji','su','gaz',
    'atik','atık','cevre','çevre','dış','iç','ihracatçi','ihracatçı','ithalatçi',
    'ithalatçı',

    'samsun','corum','çorum','sinop','tokat','amasya','ordu','kavak','bafra','tekkeköy',
    'tekkekoy','vezirköprü','vezirkopru','erfelek','atakum','çarşamba','carsamba',
    'adana','alaçam','alacam','ordu','gerze','ayancık','ayancik','boyabat','duragan',
    'durağan','saraydüzü','sarayduzu','turhal','erbaa','niksar','zile','reşadiye',
    'resadiye','almus','pazar','yeşilyurt','yesilyurt','artova','sulusaray','başçiftlik',
    'basciftlik',
    
    'garanti','bankasi','bankası','yapı','yapi','kredi','uluslararasi','uluslararası',
    'belgesi','rehberim','rehberi','ve','ile', 'yeni', 'eski', 'abi', 'bey', 'hanım', 
    'is', 'iş', 'telefonu', 'no', 'tel'
}

def get_significant_words(name):
    n = normalize_name(name)
    words = re.findall(r'[a-zçğıöşü]{3,}', n)
    return [w for w in words if w not in STOPS]

c.execute("SELECT id, company_name FROM customers WHERE id IN (3216, 3217)")
rows = c.fetchall()
for r in rows:
    print(f"ID {r[0]}: '{r[1]}'")
    print(f"  Normalized: '{normalize_name(r[1])}'")
    print(f"  Sig Words: {get_significant_words(r[1])}")

conn.close()
