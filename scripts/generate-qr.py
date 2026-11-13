"""Generate and decode-check the website QR (requires qrcode, Pillow, zxing-cpp)."""
from pathlib import Path

import qrcode
import zxingcpp
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
URL = "https://amrnaser99.github.io/birthday/"

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=24, border=4)
qr.add_data(URL)
qr.make(fit=True)
image = qr.make_image(fill_color="black", back_color="white").convert("RGB")

for output in [ROOT / "dist/assets/qr-code.png", ROOT / "QR-Website.png"]:
    image.save(output)
    decoded = zxingcpp.read_barcode(Image.open(output))
    if decoded is None or decoded.text != URL:
        raise RuntimeError(f"QR decode check failed: {output}")
    print(f"Verified {output.name}: {decoded.text}")
