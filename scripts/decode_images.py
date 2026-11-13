#!/usr/bin/env python3
"""Decode About page WebP images from text-safe source files."""
from pathlib import Path
import base64
import sys

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "images" / "source"
DEST = ROOT / "images"

def main() -> int:
    files = sorted(SRC.glob("*.webp.b64"))
    if not files:
        print("No image source files found", file=sys.stderr)
        return 1
    DEST.mkdir(parents=True, exist_ok=True)
    for src in files:
        name = src.name[:-4]  # strip .b64
        dest = DEST / name
        dest.write_bytes(base64.b64decode(src.read_text().strip()))
        print(f"Wrote {dest.relative_to(ROOT)} ({dest.stat().st_size} bytes)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
