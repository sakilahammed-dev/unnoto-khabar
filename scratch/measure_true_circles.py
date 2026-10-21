from PIL import Image

im = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792537058370_87cc55c7.png').convert('RGBA')

# 9 badges: 3 rows, 3 cols
# Rough bounding boxes around each badge to isolate it:
cells = [
    # row 0
    ("honey", 150, 0, 380, 190),
    ("honey-nuts", 380, 0, 620, 190),
    ("whole-nuts", 620, 0, 850, 190),
    # row 1
    ("dates", 170, 190, 400, 380),
    ("oil-ghee", 390, 190, 620, 380),
    ("shutki-balachaw", 620, 190, 830, 380),
    # row 2
    ("health-mix", 180, 380, 410, 572),
    ("super-seeds", 390, 380, 620, 572),
    ("pickles-spices", 610, 380, 830, 572),
]

for name, x1, y1, x2, y2 in cells:
    # Find all pixels that are NOT background white
    # Background is white: r>245 and g>245 and b>245
    non_white_x = []
    non_white_y = []
    for y in range(y1, y2):
        for x in range(x1, x2):
            r, g, b, a = im.getpixel((x, y))
            # If not pure white
            if not (r > 240 and g > 240 and b > 240):
                non_white_x.append(x)
                non_white_y.append(y)
    
    min_x, max_x = min(non_white_x), max(non_white_x)
    min_y, max_y = min(non_white_y), max(non_white_y)
    
    cx = (min_x + max_x) / 2.0
    cy = (min_y + max_y) / 2.0
    diam_x = max_x - min_x + 1
    diam_y = max_y - min_y + 1
    
    print(f"{name:15s}: x=[{min_x}, {max_x}] (w={diam_x}), y=[{min_y}, {max_y}] (h={diam_y}) -> cx={cx:.1f}, cy={cy:.1f}")

