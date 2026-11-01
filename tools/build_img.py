# Builds the site's images from the game folders on this machine (Roblox store art, Blender renders,
# a Roblox Studio capture). Every picture on the site comes from the games themselves.
# usage: python tools/build_img.py <studio capture jpg>
import os, sys, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'assets', 'img')
SITE = 'D:/claude projeler/sweax-site'
ORES = 'D:/claude projeler/maden-farm/src/art/ui'
RNG = 'C:/Users/okanb/Documents/Codex/2026-09-25/rop/claude/docs'
CAPTURE = sys.argv[1]


def save(im, rel, width=None, q=82, nearest=False):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.NEAREST if nearest else Image.LANCZOS)
    im.save(path, 'WEBP', quality=q, method=6)
    print(rel, im.size, os.path.getsize(path) // 1024, 'KB')


raw = f'{SITE}/seed/raw'
save(Image.open(f'{raw}/group-icon.png').convert('RGB'), 'studio-mark.webp', 160)
save(Image.open(f'{raw}/game-popit-icon.png').convert('RGB'), 'popit/icon.webp', 256)
save(Image.open(f'{raw}/mergeores-icon.png').convert('RGB'), 'ores/icon.webp', 256)
for i in range(1, 6):
    im = Image.open(f'{raw}/popit-t{i}.png').convert('RGB')
    save(im, f'popit/shot-{i}.webp', 768)
    save(im, f'popit/shot-{i}-s.webp', 420)
for i in range(1, 4):
    im = Image.open(f'{raw}/mo-thumb-{i}.png').convert('RGB')
    save(im, f'ores/shot-{i}.webp', 768)
    save(im, f'ores/shot-{i}-s.webp', 420)
for i in range(1, 11):
    save(Image.open(f'{ORES}/cevher_{i}.png').convert('RGBA'), f'ores/tier-{i:02d}.webp', 192, q=90, nearest=True)

# weapons all; traps only the ones the game still has (data/rng.json, from DefenseBalance.Traps)
import json
traps = {'t-' + t['id'].lower() + '.webp' for t in json.load(open(os.path.join(ROOT, 'data', 'rng.json'), encoding='utf-8'))['traps']}
for f in glob.glob(f'{SITE}/public/assets/img/arsenal/*.webp'):
    base = os.path.basename(f)
    if base.startswith('w-') or base in traps:
        save(Image.open(f).convert('RGBA'), 'rng/' + base, q=86)
save(Image.open(f'{RNG}/sandik-v3-kapali.png').convert('RGB'), 'rng/chest-closed.webp', 900)
save(Image.open(f'{RNG}/sandik-v3-acik.png').convert('RGB'), 'rng/chest-open.webp', 900)
save(Image.open(f'{RNG}/round6_station.jpg').convert('RGB'), 'rng/play-station.webp', 1400)
save(Image.open(f'{RNG}/skin-faz2-anka-elde.jpg').convert('RGB'), 'rng/play-base.webp', 1400)
save(Image.open(CAPTURE).convert('RGB'), 'rng/play-arena.webp', 1600)
