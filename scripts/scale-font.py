# Готовит Press Start 2P для игры:
# - склеивает квадратики, из которых собраны буквы, в один контур — иначе на экране iPhone между ними видны «швы»;
# - уменьшает шрифт внутри файла (больше unitsPerEm): он вдвое шире Pixelify, и так прежние font-size дают ту же плотность.
# Требует fontTools, brotli и skia-pathops: python -m pip install fonttools brotli skia-pathops
# python scripts/scale-font.py 0.75 fonts/pressstart-latin.woff2 [...]
import sys
from fontTools.ttLib import TTFont
from fontTools.ttLib.removeOverlaps import removeOverlaps

scale = float(sys.argv[1])
for path in sys.argv[2:]:
    f = TTFont(path)
    removeOverlaps(f)
    head = f['head']
    before = head.unitsPerEm
    head.unitsPerEm = round(before / scale)
    f.flavor = 'woff2'
    f.save(path)
    print(f'{path}: unitsPerEm {before} → {head.unitsPerEm}')
