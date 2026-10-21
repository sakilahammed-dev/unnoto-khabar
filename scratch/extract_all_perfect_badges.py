from PIL import Image, ImageDraw, ImageFilter
import os

raw_img = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792537058370_87cc55c7.png').convert('RGBA')

# From inward measurement:
badges_data = [
    ("honey", 283.5, 97.0, 96.5),
    ("honey-nuts", 511.5, 97.0, 95.5),
    ("whole-nuts", 724.0, 97.0, 94.5),
    ("dates", 308.5, 287.0, 96.0),
    ("oil-ghee", 511.0, 287.0, 95.5),
    ("shutki-balachaw", 717.5, 287.0, 95.0),
    ("health-mix", 318.0, 474.0, 94.5),
    ("super-seeds", 517.5, 476.0, 95.5),
    ("pickles-spices", 713.5, 474.0, 95.0),
]

os.makedirs('public/categories/emblems', exist_ok=True)
os.makedirs('scratch/test_extracted', exist_ok=True)

# Master output size for each emblem: 220x220 transparent PNG
OUT_SIZE = 220
SCALE = 4 # for 4x supersampled anti-aliased circle mask

for name, cx, cy, radius in badges_data:
    # We take a square patch centered on (cx, cy)
    # The patch size in raw image will be 2 * radius + 4
    patch_size = int(round(2 * radius + 4))
    x1 = int(round(cx - patch_size / 2.0))
    y1 = int(round(cy - patch_size / 2.0))
    x2 = x1 + patch_size
    y2 = y1 + patch_size
    
    patch = raw_img.crop((x1, y1, x2, y2))
    
    # Create smooth circular mask
    mask_large = Image.new('L', (patch_size * SCALE, patch_size * SCALE), 0)
    draw = ImageDraw.Draw(mask_large)
    mask_c = (patch_size * SCALE) / 2.0
    mask_r = radius * SCALE
    draw.ellipse([mask_c - mask_r, mask_c - mask_r, mask_c + mask_r, mask_c + mask_r], fill=255)
    
    # Slightly feather mask by 1.2px in scaled coords
    mask_large = mask_large.filter(ImageFilter.GaussianBlur(1.5))
    mask = mask_large.resize((patch_size, patch_size), Image.Resampling.LANCZOS)
    
    badge = Image.new('RGBA', (patch_size, patch_size), (0, 0, 0, 0))
    badge.paste(patch, (0, 0), mask)
    
    # Resize to standard OUT_SIZE
    badge_final = badge.resize((OUT_SIZE, OUT_SIZE), Image.Resampling.LANCZOS)
    
    badge_final.save(f'public/categories/emblems/{name}.png')
    badge_final.save(f'scratch/test_extracted/{name}.png')

# Create a test collage on a dark & light background
collage = Image.new('RGB', (OUT_SIZE * 3 + 40, OUT_SIZE * 3 + 40), (250, 245, 235))
for idx, (name, _, _, _) in enumerate(badges_data):
    r = idx // 3
    c = idx % 3
    b = Image.open(f'public/categories/emblems/{name}.png')
    collage.paste(b, (20 + c * OUT_SIZE, 20 + r * OUT_SIZE), b)

collage.save('scratch/badges_collage_test.png')
print('Extracted all 9 badges and saved collage!')
