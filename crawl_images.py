#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Domain-restricted image crawler for PNU engineering sites.

Usage:
    python crawl_images.py <site_name> <start_url> [max_pages]

Crawls within the start_url's domain (BFS), collects every image it can find
(<img src/data-src/srcset>, CSS background-image url(...), and direct links to
image files), and downloads them into ./crawled_images/<site_name>/.
"""
import os
import re
import sys
import time
import hashlib
from collections import deque
from urllib.parse import urljoin, urlparse, unquote

import requests
from bs4 import BeautifulSoup

IMG_EXT = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico", ".avif", ".tif", ".tiff")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "ko,en;q=0.8",
}
CSS_URL_RE = re.compile(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", re.I)


def log(site, msg):
    print(f"[{site}] {msg}", flush=True)


def is_image_url(url):
    path = urlparse(url).path.lower()
    return path.endswith(IMG_EXT)


def safe_filename(url):
    parsed = urlparse(url)
    name = os.path.basename(unquote(parsed.path)) or "img"
    name = re.sub(r"[^\w.\-]", "_", name)
    if not name.lower().endswith(IMG_EXT):
        name += ".img"
    # prefix with short hash of full url to avoid collisions across paths
    h = hashlib.md5(url.encode("utf-8")).hexdigest()[:8]
    return f"{h}_{name}"[:120]


def collect_images(base_url, soup, raw_html):
    found = set()

    def add(u):
        if not u:
            return
        u = u.strip()
        if u.startswith("data:") or u.startswith("javascript:"):
            return
        full = urljoin(base_url, u)
        found.add(full.split("#")[0])

    for img in soup.find_all("img"):
        add(img.get("src"))
        add(img.get("data-src"))
        add(img.get("data-original"))
        srcset = img.get("srcset") or img.get("data-srcset")
        if srcset:
            for part in srcset.split(","):
                add(part.strip().split(" ")[0])
    for src in soup.find_all("source"):
        srcset = src.get("srcset")
        if srcset:
            for part in srcset.split(","):
                add(part.strip().split(" ")[0])
    for a in soup.find_all("a", href=True):
        if is_image_url(a["href"]):
            add(a["href"])
    for tag in soup.find_all(style=True):
        for m in CSS_URL_RE.findall(tag["style"]):
            add(m)
    # inline <style> + raw css url() references
    for m in CSS_URL_RE.findall(raw_html):
        if is_image_url(m) or "/image" in m.lower() or "/img" in m.lower():
            add(m)
    return found


def crawl(site, start_url, max_pages):
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "crawled_images", site)
    os.makedirs(out_dir, exist_ok=True)
    domain = urlparse(start_url).netloc

    session = requests.Session()
    session.headers.update(HEADERS)

    seen_pages = set()
    queue = deque([start_url])
    downloaded = set()
    n_pages = 0
    n_imgs = 0
    n_fail = 0

    def download(img_url):
        nonlocal n_imgs, n_fail
        if img_url in downloaded:
            return
        downloaded.add(img_url)
        fname = safe_filename(img_url)
        fpath = os.path.join(out_dir, fname)
        if os.path.exists(fpath):
            return
        try:
            r = session.get(img_url, timeout=20, stream=True)
            ctype = r.headers.get("Content-Type", "")
            if r.status_code != 200:
                n_fail += 1
                return
            # skip obvious html error pages
            if "text/html" in ctype and not is_image_url(img_url):
                n_fail += 1
                return
            data = r.content
            if len(data) < 200:  # skip 1px trackers / empty
                return
            with open(fpath, "wb") as f:
                f.write(data)
            n_imgs += 1
            if n_imgs % 25 == 0:
                log(site, f"downloaded {n_imgs} images, {n_pages} pages crawled, queue={len(queue)}")
        except Exception:
            n_fail += 1

    while queue and n_pages < max_pages:
        url = queue.popleft()
        if url in seen_pages:
            continue
        seen_pages.add(url)
        try:
            r = session.get(url, timeout=20)
        except Exception:
            continue
        ctype = r.headers.get("Content-Type", "")
        if "text/html" not in ctype:
            if is_image_url(url):
                download(url)
            continue
        n_pages += 1
        try:
            html = r.text
            soup = BeautifulSoup(html, "html.parser")
        except Exception:
            continue

        for img in collect_images(url, soup, html):
            download(img)

        # enqueue same-domain links
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.startswith(("javascript:", "mailto:", "tel:", "#")):
                continue
            full = urljoin(url, href).split("#")[0]
            p = urlparse(full)
            if p.netloc == domain and full not in seen_pages:
                if p.path.lower().endswith(IMG_EXT):
                    download(full)
                elif p.scheme in ("http", "https"):
                    queue.append(full)

    log(site, f"DONE. pages={n_pages} images={n_imgs} failures={n_fail} -> {out_dir}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("usage: python crawl_images.py <site_name> <start_url> [max_pages]")
        sys.exit(1)
    site_name = sys.argv[1]
    start = sys.argv[2]
    max_p = int(sys.argv[3]) if len(sys.argv) > 3 else 400
    log(site_name, f"start crawl {start} (max_pages={max_p})")
    crawl(site_name, start, max_p)
