# Pulls the RNG Zombie Defense facts shown on the site straight from the game's source.
# usage: python tools/extract_rng.py <game src root> data/rng.json
import json, re, sys, os
src = sys.argv[1]
kd = os.path.join(src, 'ReplicatedStorage', 'KarantinaDefense')
bal = open(os.path.join(kd, 'DefenseBalance.lua'), encoding='utf-8').read()
rng = open(os.path.join(kd, 'Shared', 'RngConfig.lua'), encoding='utf-8').read()
loc = open(os.path.join(kd, 'Client', 'Localization.lua'), encoding='utf-8').read()
ev = open(os.path.join(kd, 'Shared', 'WaveEventInfo.lua'), encoding='utf-8').read()
lang = open(os.path.join(kd, 'Shared', 'Lang.lua'), encoding='utf-8').read()
names = open(os.path.join(kd, 'Shared', 'LangTables', 'source.lua'), encoding='utf-8').read()

max_wave = int(re.search(r'\["MaxWave"\]=(\d+)', bal).group(1))
boss_waves = [int(x) for x in re.search(r'\["BossWaves"\]=\{([\d,]+)\}', bal).group(1).split(',')]
boss_ids = re.findall(r'\["BossId"\]="(Boss\w+)"', bal)
boss_tr = {}
for bid in dict.fromkeys(boss_ids):
    m = re.search(r'\["' + bid + r'"\]=\{.*?\["Name"\]="BOSS: ([^"]+)"', bal, re.S)
    boss_tr[bid] = m.group(1)
pairs = dict(re.findall(r'\{"BOSS: ([^"]+)", "BOSS: ([^"]+)"\}', names))
seen = list(dict.fromkeys(boss_ids))
bosses = [{'wave': w, 'id': b, 'tr': boss_tr[b], 'en': pairs[boss_tr[b]]} for w, b in zip(boss_waves, seen)]

traps_block = bal[bal.index('["Traps"]={'):bal.index('["Combat"]={')]
trap_ids = list(dict.fromkeys(re.findall(r'\["Id"\]="(\w+)"', traps_block)))
traps = []
for t in trap_ids:
    m = re.search(r'itemGuides\.Trap\["' + t + r'"\]=\{tr=\{"([^"]+)","([^"]+)".*?en=\{"([^"]+)","([^"]+)"', loc)
    traps.append({'id': t, 'tr': m.group(1), 'descTr': m.group(2), 'en': m.group(3), 'descEn': m.group(4)})

rar = [{'tr': a, 'en': b, 'rgb': [int(x) for x in c.split(',')], 'weight': float(w)}
       for a, b, c, w in re.findall(r'\{Name="([^"]+)",NameEnglish="([^"]+)",Color=\{([\d,]+)\},BaseWeight=([\d.]+)\}', rng)]
pools = [re.findall(r'"(\w+)"', p) for p in re.findall(r'\{("[^}]+")\}', rng[rng.index('C.TierPools'):rng.index('C.Items')])]
items = {i: {'tr': a, 'en': c} for i, a, c in re.findall(r'\["(\w+)"\]=\{name="([^"]+)",price=\d+,role="[^"]+",nameEnglish="([^"]+)"', rng)}
weapon_ids = list(dict.fromkeys(re.findall(r'\["Id"\]="(\d\d_\w+)"', bal[:bal.index('["Movement"]')])))
starter = re.search(r'DefaultWeapon="(\w+)"', rng).group(1)
weapons = [{'id': starter, 'tier': 0, 'tr': 'Deagle', 'en': 'Deagle'}]
for n, pool in enumerate(pools, 1):
    for w in pool:
        weapons.append({'id': w, 'tier': n, **items[w]})

events = [{'id': k, 'tr': a, 'en': b, 'lineTr': c, 'lineEn': d, 'rgb': [int(x) for x in e.split(',')]}
          for k, a, b, c, d, e in re.findall(r'(\w+)=\{tr="([^"]+)",en="([^"]+)",line=\{"([^"]+)","([^"]+)"\},color=rgb\(([\d,]+)\)', ev)]
langs = re.findall(r'"([a-z-]+)"', re.search(r'M\.Codes = \{([^}]+)\}', lang).group(1))

unlocks = [{'luck': int(a), 'wave': int(b)} for a, b in re.findall(r'\{Luck=(\d+),Wave=(\d+)\}', rng)]
item_weights = [[float(x) for x in g.split(',')] for g in re.findall(r'\{([\d.,]+)\}', re.search(r'C\.ItemWeights=\{(.*)\}', rng).group(1))]
max_luck = int(re.search(r'MaxLuck=(\d+)', rng).group(1))
wave_blocks = bal[bal.index('["Waves"]={{'):bal.index('["Tuning"]={')].split('},{')
waves = []
for i, b in enumerate(wave_blocks, 1):
    e, boss = re.search(r'\["Event"\]="(\w+)"', b), re.search(r'\["BossId"\]="(\w+)"', b)
    waves.append({'wave': i, 'event': e.group(1) if e else None, 'boss': boss.group(1) if boss else None})
assert len(waves) == max_wave
assert 'beta=.8*(luck-1)/(C.MaxLuck-1)' in rng and '.12+(luck-C.Unlocks[tier].Luck)*.088' in rng and '(luck-1)/49*.85*(i-1)' in rng, 'roll formula changed: update rng.js'
out = {'maxWave': max_wave, 'waves': waves, 'maxLuck': max_luck, 'unlocks': unlocks, 'itemWeights': item_weights, 'bosses': bosses, 'weapons': weapons, 'weaponCount': len(weapon_ids),
       'traps': traps, 'rarities': rar, 'events': events, 'languages': len(langs)}
assert len(weapons) == len(weapon_ids), (len(weapons), len(weapon_ids))
json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
