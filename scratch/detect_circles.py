from PIL import Image
import math

im = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792536539923_fc3374a1.png').convert('RGB')
w, h = im.size

# The background is white (r > 240, g > 240, b > 240)
# Badges have gold borders (r in 150..230, g in 120..200, b < 100)
# Let's inspect rows and columns to find the 3x3 layout
# Estimate 3 columns:
# Col 1: x around 240
# Col 2: x around 512
# Col 3: x around 780
# Estimate 3 rows:
# Row 1: y around 100
# Row 2: y around 286
# Row 3: y around 470

# Let's find centers by looking for non-white clusters in each region
regions = [
    # (row, col)
    (0, 0, (100, 360), (10, 200)),
    (0, 1, (380, 640), (10, 200)),
    (0, 2, (660, 920), (10, 200)),
    (1, 0, (100, 360), (190, 380)),
    (1, 1, (380, 640), (190, 380)),
    (1, 2, (660, 920), (190, 380)),
    (2, 0, (100, 360), (370, 560)),
    (2, 1, (380, 640), (370, 560)),
    (2, 2, (660, 920), (370, 560)),
]

circles = []
for r_idx, c_idx, (x_min, x_max), (y_min, y_max) in regions:
    non_white_x = []
    non_white_y = []
    for y in range(y_min, y_max):
        for x in range(x_min, x_max):
            r, g, b = im.getpixel((x, y))
            # Background is clean white (r>245, g>245, b>245)
            if not (r > 245 and g > 245 and b > 245):
                non_white_x.append(x)
                non_white_y.append(y)
    if non_white_x:
        bx0, bx1 = min(non_white_x), max(non_white_x)
        by0, by1 = min(non_white_y), max(non_white_y)
        cx = (bx0 + bx1) / 2
        cy = (by0 + by1) / 2
        bw = bx1 - bx0
        bh = by1 - by0
        radius = max(bw, bh) / 2
        circles.append((r_idx, c_idx, cx, cy, radius, bx0, by0, bx1, by1))
        print(f"Circle ({r_idx}, {c_idx}): center=({cx:.1f}, {cy:.1f}), w={bw}, h={bh}, r={radius:.1f}")

