# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow"]
# ///
"""Нарезает иконку приложения в ресурсы Android-проекта (android/app/src/main/res).
Сначала: uv run assets/make_icon.py   (делает icon.png, icon_foreground.png, icon_background.png)
Потом:   uv run assets/make_android_icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).parent
RES = HERE.parent / "android" / "app" / "src" / "main" / "res"
# плотность -> размер legacy-иконки (48dp) и слоёв adaptive-иконки (108dp)
DENSITIES = {"mdpi": (48, 108), "hdpi": (72, 162), "xhdpi": (96, 216), "xxhdpi": (144, 324), "xxxhdpi": (192, 432)}


def masked(img, shape, size):
    im = img.resize((size, size), Image.LANCZOS).convert("RGBA")
    m = Image.new("L", (size * 4, size * 4), 0)
    d = ImageDraw.Draw(m)
    if shape == "circle":
        d.ellipse([0, 0, size * 4 - 1, size * 4 - 1], fill=255)
    else:
        d.rounded_rectangle([0, 0, size * 4 - 1, size * 4 - 1], radius=size * 4 // 5, fill=255)
    im.putalpha(m.resize((size, size), Image.LANCZOS))
    return im


def main():
    icon = Image.open(HERE / "icon.png").convert("RGB")
    fg = Image.open(HERE / "icon_foreground.png").convert("RGBA")
    bg = Image.open(HERE / "icon_background.png").convert("RGB")
    for name, (legacy, layer) in DENSITIES.items():
        d = RES / f"mipmap-{name}"
        d.mkdir(parents=True, exist_ok=True)
        masked(icon, "round", legacy).save(d / "ic_launcher.png", optimize=True)
        masked(icon, "circle", legacy).save(d / "ic_launcher_round.png", optimize=True)
        fg.resize((layer, layer), Image.LANCZOS).save(d / "ic_launcher_foreground.png", optimize=True)
        bg.resize((layer, layer), Image.LANCZOS).save(d / "ic_launcher_background.png", optimize=True)
    # adaptive-иконка (Android 8+) из двух слоёв
    adaptive = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '    <background android:drawable="@mipmap/ic_launcher_background"/>\n'
        '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n'
        '</adaptive-icon>\n'
    )
    v26 = RES / "mipmap-anydpi-v26"
    v26.mkdir(parents=True, exist_ok=True)
    for f in ("ic_launcher.xml", "ic_launcher_round.xml"):
        (v26 / f).write_text(adaptive, encoding="utf-8")
    # старые шаблонные слои Capacitor больше не нужны
    for old in (RES / "drawable-v24" / "ic_launcher_foreground.xml", RES / "drawable" / "ic_launcher_background.xml",
                RES / "values" / "ic_launcher_background.xml"):
        old.unlink(missing_ok=True)
    print("готово:", RES)


if __name__ == "__main__":
    main()
