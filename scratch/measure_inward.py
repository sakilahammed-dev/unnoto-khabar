from PIL import Image

im = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792537058370_87cc55c7.png').convert('RGB')

# Non-overlapping search boxes around each badge:
boxes = [
    ("honey", 170, 0, 390, 195),
    ("honey-nuts", 400, 0, 620, 195),
    ("whole-nuts", 620, 0, 830, 195),
    ("dates", 200, 190, 415, 385),
    ("oil-ghee", 415, 190, 620, 385),
    ("shutki-balachaw", 620, 190, 825, 385),
    ("health-mix", 210, 380, 415, 572),
    ("super-seeds", 415, 380, 620, 572),
    ("pickles-spices", 615, 380, 820, 572),
]

def is_badge_pixel(p):
    r, g, b = p
    # white background is r>246, g>246, b>246
    return not (r > 244 and g > 244 and b > 244)

perfect_badges = []
for name, x1, y1, x2, y2 in boxes:
    # Find topmost pixel in box
    top_y = None
    for y in range(y1, y2):
        for x in range(x1, x2):
            if is_badge_pixel(im.getpixel((x, y))):
                top_y = y
                break
        if top_y is not None:
            break
            
    # Find bottommost pixel in box
    bottom_y = None
    for y in range(y2 - 1, y1 - 1, -1):
        for x in range(x1, x2):
            if is_badge_pixel(im.getpixel((x, y))):
                bottom_y = y
                break
        if bottom_y is not None:
            break
            
    # Find leftmost pixel in box
    left_x = None
    for x in range(x1, x2):
        for y in range(y1, y2):
            if is_badge_pixel(im.getpixel((x, y))):
                left_x = x
                break
        if left_x is not None:
            break
            
    # Find rightmost pixel in box
    right_x = None
    for x in range(x2 - 1, x1 - 1, -1):
        for y in range(y1, y2):
            if is_badge_pixel(im.getpixel((x, y))):
                right_x = x
                break
        if right_x is not None:
            break
            
    cx = (left_x + right_x) / 2.0
    cy = (top_y + bottom_y) / 2.0
    w = right_x - left_x + 1
    h = bottom_y - top_y + 1
    r = (w + h) / 4.0
    perfect_badges.append((name, cx, cy, r, w, h, (left_x, top_y, right_x, bottom_y)))
    print(f"{name:15s}: center=({cx:6.1f}, {cy:6.1f}), w={w:3d}, h={h:3d}, radius={r:5.2f}")

