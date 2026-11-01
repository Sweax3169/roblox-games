# Pulls the Merge Ores tiers shown on the site straight from the game's Config.lua.
# usage: python tools/extract_ores.py <maden-farm src root> data/ores.json
import json, re, sys, os
src = sys.argv[1]
cfg = open(os.path.join(src, 'ReplicatedStorage', 'MadenFarm', 'Config.lua'), encoding='utf-8').read()
loc = open(os.path.join(src, 'ReplicatedStorage', 'MadenFarm', 'Loc.lua'), encoding='utf-8').read()
kural = open(os.path.join(src, 'ServerScriptService', 'MadenFarm', 'Kural.lua'), encoding='utf-8').read()

max_tier = int(re.search(r'Config\.MAKS_KADEME = (\d+)', cfg).group(1))
plots = int(re.search(r'Config\.ARSA_SAYISI = (\d+)', cfg).group(1))
tiers = []
for t, tr, en, val, rgb in re.findall(r'kademe\((\d+), "([^"]+)", "([^"]+)", ([\d.e+]+), Color3\.fromRGB\(([\d,]+)\)', cfg):
    if int(t) <= max_tier:
        tiers.append({'tier': int(t), 'tr': tr, 'en': en, 'value': int(float(val)), 'rgb': [int(x) for x in rgb.split(',')]})
merge = re.search(r'\["pad\.orsAlt"\] = \{ tr = "([^"]+)", en = "([^"]+)" \}', loc)
assert '>= 3' in kural
out = {'maxTier': max_tier, 'plots': plots, 'mergeCount': 3, 'mergeTr': merge.group(1), 'mergeEn': merge.group(2), 'tiers': tiers}
json.dump(out, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
