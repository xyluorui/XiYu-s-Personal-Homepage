#!/usr/bin/env python3
"""
Scans courses/*/course.json and generates courses/catalog.json.
Run from the repo root: python3 scripts/build-catalog.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
COURSES_DIR = ROOT / "courses"
CATALOG_PATH = COURSES_DIR / "catalog.json"

def build_catalog():
    courses = []
    if not COURSES_DIR.is_dir():
        print("courses/ directory not found", file=sys.stderr)
        CATALOG_PATH.write_text(json.dumps({"courses": []}, ensure_ascii=False, indent=2))
        return

    for d in sorted(COURSES_DIR.iterdir()):
        if not d.is_dir():
            continue
        meta_path = d / "course.json"
        index_path = d / "index.html"
        if not meta_path.exists() or not index_path.exists():
            continue
        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"  Skipping {d.name}: bad course.json — {e}", file=sys.stderr)
            continue
        meta["path"] = f"courses/{d.name}/"
        courses.append(meta)
        print(f"  ✓ {d.name} — {meta.get('title', '(no title)')}")

    catalog = {"courses": courses}
    CATALOG_PATH.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\nGenerated courses/catalog.json with {len(courses)} course(s).")

if __name__ == "__main__":
    build_catalog()
