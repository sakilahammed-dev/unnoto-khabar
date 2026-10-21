from PIL import Image
import math

im = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792536539923_fc3374a1.png').convert('RGB')
w, h = im.size

# Let's inspect the 9 badge centers roughly:
# Columns are spaced roughly evenly across w=1024
# Rows are spaced roughly evenly across h=572
# Centers roughly:
# cols: x ~ 285, 510, 735
# rows: y ~ 105, 285, 465

approx_centers = [
    # (id, name, bangla, cx, cy)
    ('honey', 'HONEY', 'মধু', 285, 105),
    ('honey-nuts', 'HONEY NUTS', 'হানি নাটস', 510, 105),
    ('whole-nuts', 'NUTS', 'বাদাম', 735, 105),
    ('dates', 'DATES', 'খেজুর', 285, 285),
    ('oil-ghee', 'OIL & GHEE', 'তেল ও ঘি', 510, 285),
    ('shutki-balachaw', 'DRIED FISH', 'শুঁটকি', 735, 285),
    ('health-mix', 'HEALTH MIX', 'স্বাস্থ্য মিক্স', 285, 465),
    ('super-seeds', 'SUPER SEEDS', 'সুপার সিডস', 510, 465),
    ('pickles-spices', 'PICKLES & SPICES', 'আচার ও মসলা', 735, 465),
]

# For each approx center, let's scan outwards in 4 cardinal directions (up, down, left, right)
# to find where the outermost dark/gold border transitions to pure white background (>245, >245, >245)
for cat_id, eng, bng, ax, ay in approx_centers:
    # Scan up
    top_y = ay
    while top_y > 0:
        r, g, b = im.getpixel((ax, top_y))
        if r > 245 and g > 245 and b > 245:
            break
        top_y -= 1
    # Scan down
    bot_y = ay
    while bot_y < h - 1:
        r, g, b = im.getpixel((ax, bot_y))
        if r > 245 and g > 245 and b > 245:
            break
        bot_y += 1
    # Scan left
    left_x = ax
    while left_x > 0:
        r, g, b = im.getpixel((left_x, ay))
        if r > 245 and g > 245 and b > 245:
            break
        left_x -= 1
    # Scan right
    right_x = ax
    while right_x < w - 1:
        r, g, b = im.getpixel((right_x, ay))
        if r > 245 and g > 245 and b > 245:
            break
        right_x += 1

    cx = (left_x + right_x) / 2
    cy = (top_y + bot_y) / 2
    diam_x = right_x - left_x
    diam_y = bot_y - top_y
    print(f"{cat_id} ({bng}): center=({cx:.1f}, {cy:.1f}), diam_x={diam_x}, diam_y={diam_y}, radius={(diam_x+diam_y)/4:.1f}")

