from pathlib import Path
from xml.sax.saxutils import escape
root=Path(__file__).resolve().parents[1]/'images'/'ui';root.mkdir(parents=True,exist_ok=True)
def save(name,title,content,size=32):
 document=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}" fill="none">
<title>{escape(title)}</title>
<desc>Editable vector interface artwork for The Riddle of Steel. Paths and colors can be changed independently of the game sprites.</desc>
<g stroke="#ead9af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{content}</g>
</svg>\n'''
 (root/f'{name}.svg').write_text(document,encoding='utf-8')
for name,degrees in [('move-up',0),('move-right',90),('move-down',180),('move-left',270)]:
 save(name,name.replace('-',' ').title(),f'<path transform="rotate({degrees} 16 16)" d="M16 5 29 26H3Z" fill="#ead9af" stroke="none"/>')
save('interact','Interact','<path d="M8 17V8a2 2 0 0 1 4 0v7-10a2 2 0 0 1 4 0v10-8a2 2 0 0 1 4 0v9-5a2 2 0 0 1 4 0v9c0 5-3 8-8 8h-2c-3 0-5-2-7-5l-4-5a2 2 0 0 1 3-3l4 4"/>')
save('character','Character and crafting','<path d="M8 28H4v-3c0-5 5-8 12-8s12 3 12 8v3h-4"/><circle cx="16" cy="9" r="6"/><path d="M12 20v8h8v-8M16 22v4"/>')
save('return','Return to world','<path d="m13 6-9 10 9 10M5 16h16a7 7 0 0 1 7 7"/>')
save('journey','Begin your journey','<circle cx="16" cy="16" r="12"/><path d="m21 8-3 10-7 6 3-10Z" fill="#c9a75c"/><path d="M16 2v3M16 27v3M2 16h3M27 16h3"/>')
save('alchemy','Alchemy','<path d="M11 3h10M13 3v9L6 24c-1 2 0 5 3 5h14c3 0 4-3 3-5l-7-12V3M10 20h12"/><path d="M10 23h12l2 3H8Z" fill="#70a999" stroke="none"/><circle cx="16" cy="16" r="1" fill="#ead9af" stroke="none"/>')
save('smithing','Blacksmithing','<path d="M3 12h26l-6 6h-8v4h8v5H8v-5h4v-4H7ZM9 5h13v4H9Z"/><path d="M25 3v6"/>')
save('supplies','World and supplies','<path d="M9 10V7a7 7 0 0 1 14 0v3M7 10h18l2 18H5ZM10 10v18M22 10v18M10 17h12"/><path d="M14 15h4v5h-4Z" fill="#c9a75c"/>')
save('title-crest','TROS crest','<path d="m60 3 57 57-57 57L3 60Z" fill="#090e0c" fill-opacity=".72" stroke="#c9a75c" stroke-width="2"/><text x="60" y="66" text-anchor="middle" fill="#c9a75c" stroke="none" font-family="Georgia,serif" font-size="20" font-weight="bold" letter-spacing="2">TROS</text>',120)
print(f'Created {len(list(root.glob("*.svg")))} small editable SVG interface assets; no embedded bitmap data.')
