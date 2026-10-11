# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow"]
# ///
"""Генерирует assets/banner.png (1920x1080, 16:9) и assets/banner.webp (анимация, 1152x648).
Запуск: uv run assets/make_banner.py          # оба файла
        uv run assets/make_banner.py png      # только png
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
W, H = 1920, 1080
FONT_DIRS = ["C:/Windows/Fonts/", "/usr/share/fonts/truetype/dejavu/", "/System/Library/Fonts/Supplemental/"]
BOLD = ["arialbd.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf"]
REG = ["arial.ttf", "DejaVuSans.ttf", "Arial.ttf"]
MONO = ["consola.ttf", "DejaVuSansMono.ttf", "Courier New.ttf"]


def font(names, size):
    for d in FONT_DIRS:
        for n in names:
            if (Path(d) / n).exists():
                return ImageFont.truetype(str(Path(d) / n), size)
    raise SystemExit(f"Не найден шрифт из {names}")


ACCENT = (0, 225, 255)        # щит
BOT = (255, 85, 125)          # активные боты
DEAD = (110, 120, 160)        # заблокированные
random.seed(11)

cx, cy = 1480, 560            # центр сети
x0 = 110

# ---------- узлы-«боты» ----------
nodes = []
for ring, (r, n) in enumerate([(190, 8), (310, 13), (420, 18)]):
    for i in range(n):
        a = 2 * math.pi * i / n + ring * 0.4 + random.uniform(-0.12, 0.12)
        rr = r + random.uniform(-25, 25)
        nodes.append((cx + rr * math.cos(a), cy + rr * math.sin(a) * 0.82, ring, random.random()))


def build_static():
    """Всё, что не двигается: фон, сетка, свечение, линии, текст."""
    bg = Image.new("RGB", (W, H))
    px = bg.load()
    c1, c2 = (8, 12, 30), (34, 12, 56)
    for y in range(H):
        for x in range(W):
            t = x / W * 0.6 + y / H * 0.4
            px[x, y] = tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))
    g = ImageDraw.Draw(bg, "RGBA")
    for x in range(0, W, 60):
        g.line([(x, 0), (x, H)], fill=(120, 140, 255, 14))
    for y in range(0, H, 60):
        g.line([(0, y), (W, y)], fill=(120, 140, 255, 14))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([1050, -200, 2150, 700], fill=(0, 200, 255, 80))
    gd.ellipse([-300, 550, 700, 1350], fill=(255, 60, 120, 70))
    bg = Image.alpha_composite(bg.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(170)))

    net = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    nd = ImageDraw.Draw(net)
    for (x, y, ring, _) in nodes:
        nd.line([(cx, cy), (x, y)], fill=ACCENT + (45,), width=2)
    for i, a in enumerate(nodes):
        for b in nodes[i + 1:]:
            if math.dist(a[:2], b[:2]) < 150:
                nd.line([a[:2], b[:2]], fill=(140, 170, 255, 40), width=1)
    bg = Image.alpha_composite(bg, net.filter(ImageFilter.GaussianBlur(0.6)))

    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.rounded_rectangle([x0, 190, x0 + 400, 244], radius=27, fill=ACCENT + (30,), outline=ACCENT + (200,), width=2)
    chips, x = [], x0
    d0 = ImageDraw.Draw(bg)
    for t in ["Android APK", "Node.js", "threads-api", "Capacitor"]:
        f = font(MONO, 28)
        w = int(d0.textlength(t, font=f)) + 44
        od.rounded_rectangle([x, 790, x + w, 846], radius=14, fill=(255, 255, 255, 18), outline=(160, 175, 255, 120), width=2)
        chips.append((x + 22, t))
        x += w + 16
    bg.alpha_composite(ov)
    d = ImageDraw.Draw(bg)
    d.text((x0 + 26, 217), "THREADS  ·  MASS BLOCK", font=font(MONO, 25), fill=(120, 235, 255), anchor="lm")
    d.text((x0, 400), "Threads", font=font(BOLD, 150), fill=(255, 255, 255), anchor="ls")
    d.text((x0, 550), "Blocker", font=font(BOLD, 150), fill=ACCENT, anchor="ls")
    d.text((x0, 640), "Массовая блокировка ботов и спамеров", font=font(REG, 44), fill=(210, 218, 245), anchor="ls")
    d.text((x0, 700), "по списку юзернеймов — в один клик", font=font(REG, 44), fill=(210, 218, 245), anchor="ls")
    for cxp, t in chips:
        d.text((cxp, 818), t, font=font(MONO, 28), fill=(225, 230, 255), anchor="lm")
    d.line([(x0, 960), (W - x0, 960)], fill=(160, 175, 255, 60), width=2)
    d.text((x0, 1010), "пароль не покидает устройство  ·  работает в браузере и как Android-приложение",
           font=font(REG, 28), fill=(150, 160, 205), anchor="lm")
    return bg


def lerp(a, b, k):
    return tuple(int(x + (y - x) * k) for x, y in zip(a, b))


def render(static, t=0.0):
    """Кадр для фазы t ∈ [0, 1). t=0 — вид для png."""
    TAU = 2 * math.pi
    f = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fd = ImageDraw.Draw(f)

    # волна от щита
    for k in range(2):
        p = (t + k / 2) % 1
        r = 60 + p * 400
        fd.ellipse([cx - r, cy - r * 0.82, cx + r, cy + r * 0.82], outline=ACCENT + (int(110 * (1 - p) ** 1.5),), width=3)

    # боты: активен -> луч из центра -> заблокирован (крестик) -> снова появляется
    for (x, y, ring, ph) in nodes:
        q = (t + ph) % 1
        s0 = 8 - ring
        if q < 0.45:                                   # активен, пульсирует
            pulse = 0.5 + 0.5 * math.sin(TAU * (t * 2 + ph))
            s = s0 * (0.9 + 0.3 * pulse)
            fd.ellipse([x - s * 2.6, y - s * 2.6, x + s * 2.6, y + s * 2.6], fill=BOT + (int(25 + 45 * pulse),))
            fd.ellipse([x - s, y - s, x + s, y + s], fill=BOT + (255,))
        elif q < 0.6:                                  # луч щита летит к боту
            p = (q - 0.45) / 0.15
            bx, by = cx + (x - cx) * p, cy + (y - cy) * p
            fd.line([(cx, cy), (bx, by)], fill=ACCENT + (int(120 * (1 - p * 0.5)),), width=3)
            fd.ellipse([bx - 12, by - 12, bx + 12, by + 12], fill=ACCENT + (70,))
            fd.ellipse([bx - 5, by - 5, bx + 5, by + 5], fill=(255, 255, 255, 240))
            fd.ellipse([x - s0, y - s0, x + s0, y + s0], fill=BOT + (255,))
        else:                                          # заблокирован
            fade_in = min(1, (q - 0.6) / 0.08)         # вспышка при блокировке
            fade_out = 1 - max(0, (q - 0.92) / 0.08)   # плавно исчезает перед новым циклом
            col = lerp(BOT, DEAD, fade_in)
            s = s0 * 1.1
            fd.ellipse([x - s, y - s, x + s, y + s], fill=col + (int(200 * fade_out),))
            c = s * 1.9 * (1 + 0.5 * (1 - fade_in))
            w = 3
            a = int(255 * fade_out)
            fd.line([(x - c, y - c), (x + c, y + c)], fill=(255, 255, 255, a), width=w)
            fd.line([(x - c, y + c), (x + c, y - c)], fill=(255, 255, 255, a), width=w)
            if fade_in < 1:
                r = s * (2 + 5 * fade_in)
                fd.ellipse([x - r, y - r, x + r, y + r], outline=ACCENT + (int(180 * (1 - fade_in)),), width=2)

    # щит в центре
    cp = 0.5 + 0.5 * math.sin(TAU * t)
    R = 92 + 10 * cp
    fd.ellipse([cx - R, cy - R, cx + R, cy + R], fill=ACCENT + (int(40 + 35 * cp),))
    fd.ellipse([cx - 62, cy - 62, cx + 62, cy + 62], fill=(14, 20, 48, 255), outline=ACCENT + (255,), width=5)
    shield = [(cx - 28, cy - 30), (cx + 28, cy - 30), (cx + 28, cy + 4), (cx, cy + 34), (cx - 28, cy + 4)]
    fd.polygon(shield, fill=ACCENT + (int(200 + 55 * cp),))
    fd.line([(cx - 13, cy - 2), (cx - 3, cy + 10), (cx + 15, cy - 14)], fill=(14, 20, 48, 255), width=6, joint="curve")

    return Image.alpha_composite(static, f)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    static = build_static()
    png = render(static, 0.0).convert("RGB")
    png.save(HERE / "banner.png", optimize=True)
    print(HERE / "banner.png", png.size)
    if mode == "png":
        return
    N, size = 40, (1152, 648)
    frames = [render(static, i / N).convert("RGB").resize(size, Image.LANCZOS) for i in range(N)]
    # animated WebP: полный цвет, без ограничений GIF на 256 цветов, в разы легче
    frames[0].save(HERE / "banner.webp", save_all=True, append_images=frames[1:], duration=60, loop=0,
                   quality=92, method=6, minimize_size=True)
    print(HERE / "banner.webp", f"{(HERE / 'banner.webp').stat().st_size / 1e6:.2f} MB, {N} кадров")


if __name__ == "__main__":
    main()
