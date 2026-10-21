from PIL import Image

im = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792537058370_87cc55c7.png').convert('RGB')
w, h = im.size

# Background is white: r > 245, g > 245, b > 245
# 9 circles in a 3x3 grid:
# Define rough search regions for each of the 9 items:
# Grid cells:
# row 0: y in 0..190
# row 1: y in 190..380
# row 2: y in 380..572
# col 0: x in 150..390
# col 1: x in 390..630
# col 2: x in 630..870

categories_map = [
    [("honey", "মধু"), ("honey-nuts", "হানি নাটস"), ("whole-nuts", "বাদাম")],
    [("dates", "খেজুর"), ("oil-ghee", "তেল ও ঘি"), ("shutki-balachaw", "শুঁটকি")],
    [("health-mix", "স্বাস্থ্য মিক্স"), ("super-seeds", "সুপার সিডস"), ("pickles-spices", "আচার ও মসলা")]
]

y_splits = [(0, 190), (190, 380), (380, 572)]
x_splits = [(150, 395), (395, 635), (635, 880)]

results = []

for r in range(3):
    y_min, y_max = y_splits[r]
    for c in range(3):
        x_min, x_max = x_splits[c]
        cat_id, cat_name = categories_map[r][c]
        
        # Find non-white pixels
        xs, ys = [], []
        for y in range(y_min, y_max):
            for x in range(x_min, x_max):
                r_c, g_c, b_c = im.getpixel((x, y))
                # Background is near pure white: r>248 and g>248 and b>248
                if not (r_c > 246 and g_c > 246 and b_c > 246):
                    xs.append(x)
                    ys.append(y)
        
        if xs:
            bx1, bx2 = min(xs), max(xs)
            by1, by2 = min(ys), max(ys)
            cx = (bx1 + bx2) / 2
            cy = (by1 + by2) / 2
            width = bx2 - bx1
            height = by2 - by1
            radius = max(width, height) / 2
            results.append({
                'id': cat_id,
                'name': cat_name,
                'bbox': (bx1, by1, bx2, by2),
                'center': (cx, cy),
                'radius': radius,
                'diam': max(width, height)
            })
            print(f"{cat_id} ({cat_name}): bbox=({bx1}, {by1}, {bx2}, {by2}), center=({cx:.1f}, {cy:.1f}), diam={max(width, height)}")

