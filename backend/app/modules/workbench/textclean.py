"""
Firma adı temizleme yardımcıları.

Dış kaynaklardan (TSO / ihracatçı listeleri) gelen firma adlarının sonuna
NACE faaliyet açıklaması, adres parçası (NO:, MAH., ilçe/il) vb. yapışmış olabiliyor.
Bu modül yalnızca ÖNERİ üretir; hiçbir şeyi otomatik değiştirmez.
"""
import re

LEGAL_SUFFIXES = [
    "LİMİTED ŞİRKETİ", "ANONİM ŞİRKETİ", "KOLLEKTİF ŞİRKETİ", "KOMANDİT ŞİRKETİ",
    "KOOPERATİFİ", "LTD. ŞTİ.", "LTD.ŞTİ.", "LTD ŞTİ", "A.Ş.",
]

ADDRESS_RE = re.compile(
    r"(\bNO\s*:|\bMAH\.|\bMAHALLES[İI]\b|\bCAD\.|\bCADDES[İI]\b|\bSOK\.|\bSOKA[ĞG][Iİ]\b|"
    r"\bBUL\.|\bBLV\.|\bBULVARI\b|\bİÇ KAPI\b|\bOSB MAH)",
    re.IGNORECASE,
)

# Ad sonuna yapışmış "İLÇE / İL" veya "İLÇE/SAMSUN/Türkiye" kalıbı
TRAILING_PLACE_RE = re.compile(r"\s+[A-ZÇĞİÖŞÜ]+\s*/\s*([A-ZÇĞİÖŞÜa-zçğıöşü]+\s*(/\s*\w+)?)?\s*$")


def _has_lower(token: str) -> bool:
    return any(ch.islower() for ch in token)


def suggest_clean_name(name: str):
    """(öneri, ayrılan_kısım) döner. Değişiklik gerekmiyorsa öneri == name."""
    if not name:
        return name, ""
    original = " ".join(name.split())
    # Çoğunlukla büyük harf olan adlarda: ilk küçük harfli kelimeden itibaren faaliyet açıklamasıdır
    letters = [c for c in original if c.isalpha()]
    upper_ratio = (sum(1 for c in letters if c.isupper()) / len(letters)) if letters else 1
    cut = original
    if upper_ratio > 0.7:
        tokens = original.split(" ")
        for i, tok in enumerate(tokens):
            if i >= 2 and _has_lower(tok):
                cut = " ".join(tokens[:i])
                break

    upper_cut = cut.upper()

    # Ad başında adres varsa (örn. "Tip 8 No:3/17 MARATON ... LİMİTED ŞİRKETİ"):
    # son adres ifadesinden sonraki kısmı al
    m_addr = ADDRESS_RE.search(original)
    if m_addr and m_addr.start() <= 10:
        up = original.upper()
        suf_pos = min([up.find(s) for s in LEGAL_SUFFIXES if up.find(s) > 0] or [-1])
        if suf_pos > 0:
            last = None
            for mm in ADDRESS_RE.finditer(original):
                if mm.start() < suf_pos:
                    last = mm
            tail = original[last.end():]
            tail = re.sub(r"^\s*[\w/.\-]*\d[\w/.\-]*\s*", "", tail)  # kapı no vb.
            tail = tail.lstrip(" -.,")
            if len(tail) > 8:
                cut = tail
                upper_cut = cut.upper()

    # Yasal ünvan ekinden sonrasını kes (şube adı hemen arkasındaysa koru)
    best_end = None
    for suf in LEGAL_SUFFIXES:
        idx = upper_cut.find(suf)
        # Ad doğrudan ünvanla başlıyorsa (önünde gerçek ad yoksa) bir sonraki ünvanı ara
        while idx != -1 and idx < 3:
            idx = upper_cut.find(suf, idx + len(suf))
        if idx != -1:
            end = idx + len(suf)
            if best_end is None or end < best_end:
                best_end = end
    if best_end is not None:
        rest = cut[best_end:].strip()
        m = re.match(r"^((?:\S+\s+){0,4}?ŞUBES[İI])\b", rest, re.IGNORECASE)
        keep = (" " + m.group(1)) if (m and not ADDRESS_RE.search(m.group(1))) else ""
        head = cut[:best_end]
        # "LİMİTED ŞİRKETİ SASTAŞ ... ANONİM ŞİRKETİ" -> baştaki yetim ünvanı at
        for suf in LEGAL_SUFFIXES:
            if head.upper().startswith(suf + " "):
                head = head[len(suf):].strip()
                break
        cut = head + keep


    # Adres parçası kaldıysa oradan kes
    m = ADDRESS_RE.search(cut)
    if m and m.start() > 10:
        cut = cut[: m.start()]
    cut = TRAILING_PLACE_RE.sub("", cut)
    cut = cut.strip(" ,;-/")

    # "... TİCARET LİMİTED" gibi yarım kalan ünvanı tamamla
    if re.search(r"\bLİMİTED$", cut):
        cut += " ŞİRKETİ"
    elif re.search(r"\bANONİM$", cut):
        cut += " ŞİRKETİ"

    if len(cut) < 4:
        return original, ""
    removed = original[len(cut):].strip() if original.startswith(cut) else original.replace(cut, "", 1).strip()
    return cut, removed


STOPWORDS = {
    "LİMİTED", "ŞİRKETİ", "ANONİM", "SANAYİ", "SAN", "VE", "TİCARET", "TİC", "LTD", "ŞTİ",
    "A", "Ş", "AŞ", "İÇ", "DIŞ", "İTHALAT", "İHRACAT", "PAZARLAMA", "LIMITED", "SIRKETI",
}


def name_key(name: str) -> str:
    """Mükerrer tespiti için normalize anahtar (yasal ekler/noktalama atılır)."""
    clean, _ = suggest_clean_name(name or "")
    s = clean.upper().replace("I", "I")
    s = re.sub(r"[^\wÇĞİÖŞÜ ]", " ", s)
    toks = [t for t in s.split() if t not in STOPWORDS]
    return " ".join(toks)


def phone_key(phone: str) -> str:
    if not phone:
        return ""
    d = re.sub(r"\D", "", phone)
    if d.startswith("90") and len(d) == 12:
        d = d[2:]
    elif d.startswith("0") and len(d) == 11:
        d = d[1:]
    return d if len(d) == 10 else ""
