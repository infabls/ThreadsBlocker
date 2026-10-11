# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow"]
# ///
"""Генерирует assets/icon.png (1024x1024) и assets/icon_preview.png (как иконка выглядит на телефоне).
Запуск: uv run assets/make_icon.py
Иконка квадратная, весь значок в центре (безопасная зона adaptive-иконки Android ≈ 66%)."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).parent
N = 1024            # итоговый размер
SS = 3              # рендер в 3x и уменьшение — гладкие края
S = N * SS
ACCENT = (0, 225, 255)
BOT = (255, 85, 125)
BG1, BG2 = (8, 12, 30), (44, 14, 70)


def bez(p0, p1, p2, p3, n=40):
    return [tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d
                  for a, b, c, d in zip(p0, p1, p2, p3)) for t in [i / n for i in range(n + 1)]]


def shield(cx, cy, h):
    """Контур щита; h — половина высоты."""
    k = h
    right = (bez((0, -.97), (.30, -.97), (.55, -.84), (.82, -.70)) +
             bez((.82, -.70), (.82, -.40), (.82, -.05), (.82, .10)) +
             bez((.82, .10), (.82, .55), (.38, .82), (0, 1.0)))
    left = [(-x, y) for x, y in reversed(right)]
    return [(cx + x * k * .86, cy + y * k) for x, y in right + left]


def main():
    # фон: диагональный градиент + мягкие свечения
    grad = Image.new("RGB", (2, 2))
    grad.putdata([BG1, (22, 12, 52), (22, 12, 52), BG2])
    bg = grad.resize((S, S), Image.BICUBIC).convert("RGBA")
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([S * .25, S * .18, S * 1.05, S * .85], fill=ACCENT + (95,))
    gd.ellipse([-S * .2, S * .55, S * .55, S * 1.2], fill=BOT + (70,))
    bg = Image.alpha_composite(bg, glow.filter(ImageFilter.GaussianBlur(S * .16)))

    bg_only = bg.copy()                           # слой фона для adaptive-иконки
    fg = Image.new("RGBA", (S, S), (0, 0, 0, 0))  # слой значка (щит + запрет) на прозрачном
    cx, cy = S / 2, S / 2 + S * .01
    h = S * .31                                  # половина высоты щита (≈62% высоты иконки)
    pts = shield(cx, cy, h)

    # свечение за щитом
    halo = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(halo).polygon(pts, fill=ACCENT + (150,))
    fg = Image.alpha_composite(fg, halo.filter(ImageFilter.GaussianBlur(S * .035)))

    d = ImageDraw.Draw(fg)
    # щит: тёмная заливка + неоновый контур
    d.polygon(pts, fill=(12, 18, 44, 255))
    d.line(pts + [pts[0]], fill=ACCENT + (255,), width=int(S * .018), joint="curve")
    inner = shield(cx, cy, h * .90)
    d.line(inner + [inner[0]], fill=ACCENT + (70,), width=int(S * .005), joint="curve")

    # символ запрета: кольцо + диагональ
    r = S * .165
    cyy = cy - S * .012
    w = int(S * .042)
    d.ellipse([cx - r, cyy - r, cx + r, cyy + r], outline=BOT + (255,), width=w)
    a = math.radians(135)
    dx, dy = math.cos(a) * (r - w * .35), math.sin(a) * (r - w * .35)
    d.line([(cx + dx, cyy - dy), (cx - dx, cyy + dy)], fill=BOT + (255,), width=w)
    # блик внутри кольца
    ring_glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(ring_glow).ellipse([cx - r, cyy - r, cx + r, cyy + r], outline=BOT + (120,), width=int(w * 1.4))
    fg = Image.alpha_composite(fg, ring_glow.filter(ImageFilter.GaussianBlur(S * .014)))

    bg_only.convert("RGB").resize((N, N), Image.LANCZOS).save(HERE / "icon_background.png", optimize=True)
    fg.resize((N, N), Image.LANCZOS).save(HERE / "icon_foreground.png", optimize=True)
    icon = Image.alpha_composite(bg_only, fg).convert("RGB").resize((N, N), Image.LANCZOS)
    icon.save(HERE / "icon.png", optimize=True)
    print(HERE / "icon.png", icon.size)

    # превью: квадрат, скруглённый квадрат, круг и мелкие размеры
    def masked(img, shape, size):
        im = img.resize((size, size), Image.LANCZOS).convert("RGBA")
        m = Image.new("L", (size * 4, size * 4), 0)
        md = ImageDraw.Draw(m)
        if shape == "circle":
            md.ellipse([0, 0, size * 4 - 1, size * 4 - 1], fill=255)
        elif shape == "round":
            md.rounded_rectangle([0, 0, size * 4 - 1, size * 4 - 1], radius=size * 4 // 4.5, fill=255)
        else:
            md.rectangle([0, 0, size * 4, size * 4], fill=255)
        im.putalpha(m.resize((size, size), Image.LANCZOS))
        return im

    W, H = 1200, 560
    prev = Image.new("RGB", (W, H), (24, 26, 36))
    x = 40
    for shape, size in [("square", 300), ("round", 300), ("circle", 300)]:
        prev.paste(masked(icon, shape, size), (x, 40), masked(icon, shape, size))
        x += size + 30
    x = 40
    for size in (96, 64, 48):
        im = masked(icon, "round", size)
        prev.paste(im, (x, 400), im)
        x += size + 28
    prev.save(HERE / "icon_preview.png", optimize=True)
    print(HERE / "icon_preview.png")


if __name__ == "__main__":
    main()
