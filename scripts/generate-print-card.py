"""Render a 300 DPI A6 birthday card with the published website QR."""

from pathlib import Path
from random import Random

import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.units import mm
from reportlab.pdfgen.canvas import Canvas
import zxingcpp


ROOT = Path(__file__).resolve().parents[1]
QR_PATH = ROOT / "dist/assets/qr-code.png"
PNG_PATH = ROOT / "QR-Card-Print-Cropped.png"
PDF_PATH = ROOT / "QR-Card-A6.pdf"
OUTPUT_PDF = ROOT / "output/pdf/Birthday-QR-Card-A6.pdf"
URL = "https://amrnaser99.github.io/birthday/"
W, H = 1240, 1748  # A6 at about 300 DPI


def arabic(value: str) -> str:
    return get_display(arabic_reshaper.reshape(value))


def centered(draw: ImageDraw.ImageDraw, value: str, y: int, font: ImageFont.FreeTypeFont, fill: str) -> None:
    shaped = arabic(value)
    box = draw.textbbox((0, 0), shaped, font=font)
    draw.text(((W - (box[2] - box[0])) / 2, y - box[1]), shaped, font=font, fill=fill)


qr = Image.open(QR_PATH).convert("RGB")
decoded_qr = zxingcpp.read_barcode(qr)
if decoded_qr is None or decoded_qr.text != URL:
    raise RuntimeError("The source QR does not contain the published website URL")

image = Image.new("RGB", (W, H))
px = image.load()
for y in range(H):
    for x in range(W):
        edge = abs(x - W / 2) / (W / 2)
        glow = max(0, 1 - ((x - W * .5) / (W * .7)) ** 2 - ((y - H * .24) / (H * .5)) ** 2)
        px[x, y] = (
            int(29 + 48 * glow - 8 * edge),
            int(10 + 16 * glow - 2 * edge),
            int(27 + 29 * glow - 4 * edge),
        )

draw = ImageDraw.Draw(image)
gold = "#e3bc77"
cream = "#fff2df"
rose = "#ecafbf"
muted = "#e5ced6"

draw.rounded_rectangle((51, 51, W - 51, H - 51), radius=36, outline=gold, width=3)
draw.rounded_rectangle((64, 64, W - 64, H - 64), radius=28, outline="#76515b", width=2)

random = Random(14112026)
for _ in range(95):
    x, y = random.randrange(105, W - 105), random.randrange(115, H - 110)
    if 680 < y < 1380 and 215 < x < W - 215:
        continue
    size = random.choice((1, 2, 2, 3, 4))
    draw.ellipse((x - size, y - size, x + size, y + size), fill=random.choice(("#a56e74", "#d8a376", "#f1cba0")))

draw.line((290, 183, 495, 183), fill=gold, width=2)
draw.line((745, 183, 950, 183), fill=gold, width=2)
draw.ellipse((615, 177, 625, 187), fill=gold)

latin = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 55)
heart_font = ImageFont.truetype("C:/Windows/Fonts/seguisym.ttf", 48)
title = ImageFont.truetype("C:/Windows/Fonts/tahomabd.ttf", 82)
sub = ImageFont.truetype("C:/Windows/Fonts/tahomabd.ttf", 43)
body = ImageFont.truetype("C:/Windows/Fonts/tahoma.ttf", 42)
small = ImageFont.truetype("C:/Windows/Fonts/tahoma.ttf", 36)

draw.text((547, 112), "A", font=latin, fill=cream, anchor="mt")
draw.text((W / 2, 121), "♥", font=heart_font, fill=rose, anchor="mt")
draw.text((693, 112), "M", font=latin, fill=cream, anchor="mt")
centered(draw, "عيد ميلاد سعيد", 246, title, cream)
centered(draw, "يا منش", 356, title, rose)
centered(draw, "كل سنة وإنتِ أجمل وأحلى حاجة في حياتي", 492, sub, cream)
centered(draw, "في مفاجأة مخصوص ليكي…", 600, body, muted)

# Keep a large white quiet zone around the code so it scans from paper reliably.
frame = (267, 718, 973, 1424)
draw.rounded_rectangle((frame[0] + 8, frame[1] + 14, frame[2] + 8, frame[3] + 14), radius=32, fill="#150b12")
draw.rounded_rectangle(frame, radius=32, fill="white")
qr_resized = qr.resize((644, 644), Image.Resampling.NEAREST)
image.paste(qr_resized, (298, 749))

centered(draw, "امسحي الكود وافتحي هديتك", 1470, body, cream)
draw.text((W / 2, 1555), "14  ·  11  ·  2026", font=latin, fill=gold, anchor="mt")
centered(draw, "من عمرو… بكل الحب", 1625, small, muted)

image.save(PNG_PATH, dpi=(300, 300))
for target in (PDF_PATH, OUTPUT_PDF):
    target.parent.mkdir(parents=True, exist_ok=True)
    pdf = Canvas(str(target), pagesize=(105 * mm, 148 * mm))
    pdf.setTitle("Birthday QR card - Amr and Mona")
    pdf.drawImage(str(PNG_PATH), 0, 0, width=105 * mm, height=148 * mm)
    pdf.showPage()
    pdf.save()

decoded_card = zxingcpp.read_barcode(Image.open(PNG_PATH))
if decoded_card is None or decoded_card.text != URL:
    raise RuntimeError("The finished printable card does not scan to the website")

print(f"Verified printable card: {decoded_card.text}")
print(f"PNG: {PNG_PATH}")
print(f"PDF: {OUTPUT_PDF}")
