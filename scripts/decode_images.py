#!/usr/bin/env python3
"""Decode About page WebP images and assemble the static site into public/."""
from pathlib import Path
import base64
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "images" / "source"
PUBLIC = ROOT / "public"
SKIP_NAMES = {".git", "public", "scripts", "images", "api", "__pycache__"}
SKIP_SUFFIXES = {".py", ".b64", ".example"}

def decode_images(dest_images: Path) -> int:
    files = sorted(set(SRC.glob("*.webp.b64")) | set(SRC.glob("*.jpg.b64")) | set(SRC.glob("*.jpeg.b64")))
    if not files:
        print("No image source files found", file=sys.stderr)
        return 0
    dest_images.mkdir(parents=True, exist_ok=True)
    for src in files:
        name = src.name[:-4]  # strip .b64
        dest = dest_images / name
        dest.write_bytes(base64.b64decode(src.read_text().strip()))
        print(f"Wrote {dest.relative_to(ROOT)} ({dest.stat().st_size} bytes)")
    return len(files)

def copy_site() -> None:
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(parents=True)
    # Copy top-level static files
    for item in ROOT.iterdir():
        if item.name in SKIP_NAMES or item.name.startswith("."):
            continue
        if item.is_file() and item.suffix in SKIP_SUFFIXES:
            continue
        target = PUBLIC / item.name
        if item.is_dir():
            shutil.copytree(item, target, ignore=shutil.ignore_patterns("__pycache__", "*.py", ".DS_Store"))
        else:
            shutil.copy2(item, target)
    # Copy existing binary images such as og-image.jpg, then decoded about images
    src_images = ROOT / "images"
    dest_images = PUBLIC / "images"
    dest_images.mkdir(parents=True, exist_ok=True)
    if src_images.exists():
        for img in src_images.iterdir():
            if img.is_file() and img.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"}:
                shutil.copy2(img, dest_images / img.name)

def main() -> int:
    copy_site()
    count = decode_images(PUBLIC / "images")
    if count == 0:
        return 1
    print(f"Assembled public/ with {count} decoded images")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
