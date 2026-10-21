from PIL import Image
from collections import deque
import os

raw_img = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792537058370_87cc55c7.png').convert('RGBA')

# Bounding boxes with a safe margin around each badge:
badge_crops = [
    ("honey", 180, 0, 385, 195),
    ("honey-nuts", 405, 0, 615, 195),
    ("whole-nuts", 625, 0, 825, 195),
    ("dates", 205, 185, 410, 385),
    ("oil-ghee", 405, 185, 615, 385),
    ("shutki-balachaw", 615, 185, 820, 385),
    ("health-mix", 215, 375, 420, 572),
    ("super-seeds", 415, 375, 620, 572),
    ("pickles-spices", 610, 375, 815, 572),
]

os.makedirs('public/categories/emblems', exist_ok=True)
OUT_SIZE = 240

def remove_outer_white(crop_img):
    # crop_img is RGBA
    w, h = crop_img.size
    pix = crop_img.load()
    
    # BFS from all 4 borders
    queue = deque()
    visited = set()
    
    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h - 1))
        visited.add((x, 0))
        visited.add((x, h - 1))
    for y in range(h):
        queue.append((0, y))
        queue.append((w - 1, y))
        visited.add((0, y))
        visited.add((w - 1, y))
        
    while queue:
        x, y = queue.popleft()
        r, g, b, a = pix[x, y]
        # Check if white-ish background:
        # Outer gold ring has r in 150..220, g in 120..180, b in 40..110
        # Background is white / off-white: r > 230 and g > 230 and b > 215
        # Also light grayish aliasing: min(r, g, b) > 210
        is_bg = (r > 225 and g > 225 and b > 215) or (min(r, g, b) > 215 and abs(r - g) < 20 and abs(r - b) < 20)
        
        if is_bg:
            pix[x, y] = (0, 0, 0, 0) # make transparent
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    return crop_img

for name, x1, y1, x2, y2 in badge_crops:
    crop = raw_img.crop((x1, y1, x2, y2)).copy()
    cleaned = remove_outer_white(crop)
    # Find bounding box of non-transparent content
    bbox = cleaned.getbbox()
    if bbox:
        badge_tight = cleaned.crop(bbox)
        # Pad to square
        bw, bh = badge_tight.size
        max_dim = max(bw, bh)
        sq = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
        sq.paste(badge_tight, ((max_dim - bw) // 2, (max_dim - bh) // 2))
        final_badge = sq.resize((OUT_SIZE, OUT_SIZE), Image.Resampling.LANCZOS)
        final_badge.save(f'public/categories/emblems/{name}.png')

# Test collage on dark background
bg_dark = (20, 35, 25)
collage_dark = Image.new('RGB', (OUT_SIZE * 3 + 40, OUT_SIZE * 3 + 40), bg_dark)
for idx, (name, _, _, _, _) in enumerate(badge_crops):
    r = idx // 3
    c = idx % 3
    b = Image.open(f'public/categories/emblems/{name}.png')
    collage_dark.paste(b, (20 + c * OUT_SIZE, 20 + r * OUT_SIZE), b)

collage_dark.save('scratch/badges_collage_floodfill_test.png')
print('Flood fill background removal complete!')
