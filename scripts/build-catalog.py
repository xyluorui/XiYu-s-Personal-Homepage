#!/usr/bin/env python3
"""
Scans courses/*/course.json → courses/catalog.json
Scans articles/*/article.json → articles/catalog.json
Run from the repo root: python3 scripts/build-catalog.py
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent.parent


def build_courses():
    courses_dir = ROOT / "courses"
    catalog_path = courses_dir / "catalog.json"
    courses = []
    if not courses_dir.is_dir():
        print("courses/ directory not found", file=sys.stderr)
        catalog_path.write_text(json.dumps({"courses": []}, ensure_ascii=False, indent=2))
        return
    for d in sorted(courses_dir.iterdir()):
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
        print(f"  ✓ course: {d.name} — {meta.get('title', '(no title)')}")
    courses.sort(key=lambda x: x.get("date", ""), reverse=True)
    catalog_path.write_text(
        json.dumps({"courses": courses}, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"Generated courses/catalog.json with {len(courses)} course(s).")


def build_articles():
    articles_dir = ROOT / "articles"
    catalog_path = articles_dir / "catalog.json"
    articles_dir.mkdir(exist_ok=True)
    articles = []
    for d in sorted(articles_dir.iterdir()):
        if not d.is_dir():
            continue
        meta_path = d / "article.json"
        if not meta_path.exists():
            continue
        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"  Skipping {d.name}: bad article.json — {e}", file=sys.stderr)
            continue
        if "url" not in meta:
            index_path = d / "index.html"
            if index_path.exists():
                meta["path"] = f"articles/{d.name}/"
        articles.append(meta)
        print(f"  ✓ article: {d.name} — {meta.get('title', '(no title)')}")
    articles.sort(key=lambda x: x.get("date", ""), reverse=True)
    catalog_path.write_text(
        json.dumps({"articles": articles}, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"Generated articles/catalog.json with {len(articles)} article(s).")


def build_recommendations():
    recs_dir = ROOT / "recommendations"
    catalog_path = recs_dir / "catalog.json"
    recs_dir.mkdir(exist_ok=True)
    recs = []
    for d in sorted(recs_dir.iterdir()):
        if not d.is_dir():
            continue
        meta_path = d / "recommendation.json"
        if not meta_path.exists():
            continue
        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"  Skipping {d.name}: bad recommendation.json — {e}", file=sys.stderr)
            continue
        recs.append(meta)
        print(f"  ✓ recommendation: {d.name} — {meta.get('title', '(no title)')}")
    recs.sort(key=lambda x: x.get("date", ""), reverse=True)
    catalog_path.write_text(
        json.dumps({"recommendations": recs}, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"Generated recommendations/catalog.json with {len(recs)} recommendation(s).")


def stamp_assets():
    """Inject today's date as ?v=YYYYMMDD on styles.css and main.js to bust CDN cache."""
    index_path = ROOT / "index.html"
    v = date.today().strftime("%Y%m%d")
    html = index_path.read_text(encoding="utf-8")
    html = re.sub(r'href="styles\.css(?:\?v=\d+)?"', f'href="styles.css?v={v}"', html)
    html = re.sub(r'src="main\.js(?:\?v=\d+)?"',   f'src="main.js?v={v}"',   html)
    index_path.write_text(html, encoding="utf-8")
    print(f"Stamped styles.css and main.js with ?v={v}")


if __name__ == "__main__":
    build_courses()
    build_articles()
    build_recommendations()
    stamp_assets()
