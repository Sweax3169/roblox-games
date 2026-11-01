# README banner for the roblox-games repo, dark and light, as animated SVG.
# Three small tiles act out each game: a pop-it that pops and adds +1, three ores that merge into the
# next one, and the six rarity lights of the weapon roll.
# usage: python tools/art.py art
import os, sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
FONT = "'Segoe UI Variable Display','Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif"
T = {
    'dark': dict(bg='#0C0E13', edge='rgba(255,255,255,.10)', ink='#EEF0F5', ink2='rgba(238,240,245,.72)', ink3='rgba(238,240,245,.45)', chip='rgba(255,255,255,.05)'),
    'light': dict(bg='#F5F3EF', edge='rgba(20,20,30,.12)', ink='#15171C', ink2='rgba(21,23,28,.72)', ink3='rgba(21,23,28,.5)', chip='rgba(20,20,30,.04)'),
}
RARITY = ['#9BB2A0', '#5DC180', '#51A0D9', '#A26FD2', '#E1AE43', '#DB6D4F']
ORES = ['#6EB450', '#7F7F7F', '#2D2D32']

STYLE = '''<style>
  .b{animation:pop 3.6s cubic-bezier(.3,1.6,.4,1) infinite;transform-box:fill-box;transform-origin:center}
  @keyframes pop{0%,8%{transform:scale(1)}14%,60%{transform:scale(.78);opacity:.75}70%,100%{transform:scale(1);opacity:1}}
  .p1{animation:up 3.6s ease-out infinite}
  @keyframes up{0%,10%{opacity:0;transform:translateY(0)}18%{opacity:1}45%,100%{opacity:0;transform:translateY(-34px)}}
  .o{animation:merge 3.6s cubic-bezier(.5,0,.3,1) infinite;transform-box:fill-box;transform-origin:center}
  @keyframes merge{0%,20%{transform:translateX(0);opacity:1}45%,100%{transform:translateX(var(--d));opacity:0}}
  .n{animation:born 3.6s cubic-bezier(.3,1.6,.4,1) infinite;transform-box:fill-box;transform-origin:center}
  @keyframes born{0%,44%{transform:scale(0)}58%{transform:scale(1.18)}66%,88%{transform:scale(1)}100%{transform:scale(0)}}
  .r{animation:lit 3.6s linear infinite;opacity:.3}
  @keyframes lit{0%,14%{opacity:1}24%,100%{opacity:.3}}
  .t{animation:bob 7s ease-in-out infinite}.t2{animation-delay:-2.3s}.t3{animation-delay:-4.6s}
  @keyframes bob{50%{transform:translateY(-6px)}}
  @media (prefers-reduced-motion:reduce){.b,.p1,.o,.n,.r,.t{animation:none}.r{opacity:1}.p1{opacity:0}.n{transform:scale(1)}}
</style>'''


def popit(x, y):
    cols = ['#FF9CC9', '#F6DEB6', '#A35A33']
    bubs = ''
    for r in range(3):
        for c in range(3):
            d = (r * 3 + c) * .32
            bubs += f'<circle class="b" style="animation-delay:{d:.2f}s" cx="{x + 38 + c * 42}" cy="{y + 48 + r * 42}" r="16" fill="{cols[r]}"/>'
    return f'''<g class="t"><rect x="{x}" y="{y}" width="160" height="160" rx="34" fill="#FF3F97"/><rect x="{x}" y="{y + 150}" width="160" height="10" rx="5" fill="#C81E6E"/>
{bubs}<text class="p1" x="{x + 120}" y="{y + 40}" font-family="{FONT}" font-size="26" font-weight="800" fill="#fff">+1</text></g>'''


def ores(x, y):
    tiles = ''
    for i, dx in enumerate((-46, 0, 46)):
        tiles += f'<rect class="o" style="--d:{-dx}px" x="{x + 62 + dx}" y="{y + 66}" width="36" height="36" fill="{ORES[0]}" stroke="#0B0E12" stroke-width="3"/>'
    return f'''<g class="t t2"><rect x="{x}" y="{y}" width="160" height="160" rx="4" fill="#1D232B" stroke="#0B0E12" stroke-width="4"/>
<rect x="{x}" y="{y}" width="160" height="16" fill="#7D5534"/>{tiles}
<rect class="n" x="{x + 58}" y="{y + 62}" width="44" height="44" fill="{ORES[1]}" stroke="#0B0E12" stroke-width="3"/>
<rect x="{x + 18}" y="{y + 136}" width="124" height="4" fill="#A7B1BB"/></g>'''


def rng(x, y):
    segs = ''.join(f'<rect class="r" style="animation-delay:{i * .6:.1f}s" x="{x + 18 + i * 21}" y="{y + 128}" width="17" height="8" fill="{c}"/>' for i, c in enumerate(RARITY))
    return f'''<g class="t t3"><path d="M{x + 18} {y}H{x + 160}V{y + 142}L{x + 142} {y + 160}H{x}V{y + 18}Z" fill="#1B1F23"/>
<path d="M{x + 80} {y + 34}l30 17v34l-30 17-30-17v-34z" fill="none" stroke="#E1AE43" stroke-width="5"/><path d="M{x + 80} {y + 56}l11 6.5v13L{x + 80} {y + 82}l-11-6.5v-13z" fill="#E1AE43"/>{segs}</g>'''


def banner(theme):
    c = T[theme]
    W, H = 1280, 400
    games = [('+1 Speed POP IT Escape', 'Out on Roblox', '#FF3F97'), ('Merge Ores', 'Out on Roblox', '#45DD77'), ('RNG Zombie Defense', 'Coming soon', '#E1AE43')]
    chips, cx = '', 84
    for name, state, dot in games:
        w = 30 + 8.1 * len(name)
        chips += f'<rect x="{cx}" y="300" width="{w:.0f}" height="34" rx="9" fill="{c["chip"]}" stroke="{c["edge"]}"/><circle cx="{cx + 16}" cy="317" r="4.5" fill="{dot}"/><text x="{cx + 28}" y="322" font-family="{FONT}" font-size="14.5" font-weight="600" fill="{c["ink2"]}">{name}</text>'
        cx += w + 10
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="Roblox games by Sweax Studios">
{STYLE}
<rect width="{W}" height="{H}" rx="24" fill="{c['bg']}"/>
<rect x=".5" y=".5" width="{W - 1}" height="{H - 1}" rx="23.5" fill="none" stroke="{c['edge']}"/>
<text x="84" y="104" font-family="{FONT}" font-size="16" fill="{c['ink3']}">Sweax Studios · sweax3169.github.io/roblox-games</text>
<text x="80" y="190" font-family="{FONT}" font-size="78" font-weight="800" letter-spacing="-2.5" fill="{c['ink']}">Roblox games</text>
<text x="84" y="244" font-family="{FONT}" font-size="22" fill="{c['ink2']}">Two are out on Roblox, the third is on its way.</text>
{chips}
{popit(730, 120)}
{ores(910, 120)}
{rng(1090, 120)}
</svg>'''


for theme in ('dark', 'light'):
    open(os.path.join(OUT, f'banner-{theme}.svg'), 'w', encoding='utf-8').write(banner(theme))
print('ok')
