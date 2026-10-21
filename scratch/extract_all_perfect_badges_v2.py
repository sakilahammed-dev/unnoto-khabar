from PIL import Image, ImageDraw, ImageFilter
import os

raw_img = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792537058370_87cc55c7.png').convert('RGBA')

# Precise centers with r = 91.5
badges_data = [
    ("honey", 283.5, 97.0, 91.5),
    ("honey-nuts", 511.5, 97.0, 91.5),
    ("whole-nuts", 724.0, 97.0, 91.5),
    ("dates", 308.5, 287.0, 91.5),
    ("oil-ghee", 511.0, 287.0, 91.5),
    ("shutki-balachaw", 717.5, 287.0, 91.5),
    ("health-mix", 318.0, 474.0, 91.5),
    ("super-seeds", 517.5, 476.0, 91.5),
    ("pickles-spices", 713.5, 474.0, 91.5),
]

os.makedirs('public/categories/emblems', exist_ok=True)
OUT_SIZE = 240
SCALE = 4

for name, cx, cy, radius in badges_data:
    patch_size = int(round(2 * radius + 4))
    x1 = int(round(cx - patch_size / 2.0))
    y1 = int(round(cy - patch_size / 2.0))
    x2 = x1 + patch_size
    y2 = y1 + patch_size
    
    patch = raw_img.crop((x1, y1, x2, y2))
    
    mask_large = Image.new('L', (patch_size * SCALE, patch_size * SCALE), 0)
    draw = ImageDraw.Draw(mask_large)
    mask_c = (patch_size * SCALE) / 2.0
    mask_r = radius * SCALE
    draw.ellipse([mask_c - mask_r, mask_c - mask_r, mask_c + mask_r, mask_c + mask_r], fill=255)
    
    mask_large = mask_large.filter(ImageFilter.GaussianBlur(1.2))
    mask = mask_large.resize((patch_size, patch_size), Image.Resampling.LANCZOS)
    
    badge = Image.new('RGBA', (patch_size, patch_size), (0, 0, 0, 0))
    badge.paste(patch, (0, 0), mask)
    
    badge_final = badge.resize((OUT_SIZE, OUT_SIZE), Image.Resampling.LANCZOS)
    badge_final.save(f'public/categories/emblems/{name}.png')

# Create test collage on dark background to check for any white fringe
bg_dark = (20, 35, 25)
collage_dark = Image.new('RGB', (OUT_SIZE * 3 + 40, OUT_SIZE * 3 + 40), bg_dark)
for idx, (name, _, _, _) in enumerate(badges_data):
    r = idx // 3
    c = idx % 3
    b = Image.open(f'public/categories/emblems/{name}.png')
    collage_dark.paste(b, (20 + c * OUT_SIZE, 20 + r * OUT_SIZE), b)

collage_dark.save('scratch/badges_collage_dark_test.png')

# Create test collage on light background
bg_light = (255, 250, 245)
collage_light = Image.new('RGB', (OUT_SIZE * 3 + 40, OUT_SIZE * 3 + 40), bg_light)
for idx, (name, _, _, _) in enumerate(badges_data):
    r = idx // 3
    c = idx % 3
    b = Image.open(f'public/categories/emblems/{name}.png')
    collage_light.paste(b, (20 + c * OUT_SIZE, 20 + r * OUT_SIZE), b)

collage_light.save('scratch/badges_collage_light_test.png')
print('Clean extraction complete!')
