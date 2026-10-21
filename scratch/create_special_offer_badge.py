from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

# We can take one of the clean badges as the base template
# e.g., honey.png (240x240)
template = Image.open('public/categories/emblems/honey.png').convert('RGBA')
w, h = template.size
cx, cy = w / 2.0, h / 2.0

# 1. Clear out the inner illustration and the old text "মধু" / "HONEY"
# Inner area has radius ~ 88 px (inside the green ring which has radius ~ 92)
# The inner background is cream with sparkles.
# Let's create a clean circular patch inside radius 88 with the exact cream starlight texture
patch = Image.new('RGBA', (w, h), (0, 0, 0, 0))
pdraw = ImageDraw.Draw(patch)

# Sample the background color from the badge (e.g. at radius 60, angle 45 deg)
# The background is a soft radial gradient from (255, 252, 238) in center to (225, 230, 205) at edges
for r in range(86, -1, -1):
    factor = r / 86.0
    # radial blend between center cream (255, 252, 240) and outer soft sage cream (220, 230, 200)
    cr = int(255 * (1 - factor) + 218 * factor)
    cg = int(252 * (1 - factor) + 228 * factor)
    cb = int(240 * (1 - factor) + 195 * factor)
    pdraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(cr, cg, cb, 255))

# Add soft sparkles inside
sparkles_coords = [
    (cx - 50, cy - 30), (cx + 55, cy - 25), (cx - 45, cy + 35), (cx + 50, cy + 30),
    (cx - 30, cy - 50), (cx + 35, cy - 45), (cx - 60, cy + 10), (cx + 60, cy + 5)
]
for sx, sy in sparkles_coords:
    # draw a subtle soft gold sparkle
    pdraw.ellipse([sx - 1.5, sy - 1.5, sx + 1.5, sy + 1.5], fill=(255, 255, 255, 240))
    pdraw.line([sx - 4, sy, sx + 4, sy], fill=(255, 235, 170, 180), width=1)
    pdraw.line([sx, sy - 4, sx, sy + 4], fill=(255, 235, 170, 180), width=1)

# Mask the patch to inside radius 86
mask_inner = Image.new('L', (w, h), 0)
midraw = ImageDraw.Draw(mask_inner)
midraw.ellipse([cx - 86, cy - 86, cx + 86, cy + 86], fill=255)

# Keep the outer gold and green borders from the template
base = template.copy()
base.paste(patch, (0, 0), mask_inner)

# Also redraw the inner thin gold/green circular boundary line at r=86
idraw = ImageDraw.Draw(base)
idraw.ellipse([cx - 86, cy - 86, cx + 86, cy + 86], outline=(16, 69, 0, 255), width=2)
idraw.ellipse([cx - 84, cy - 84, cx + 84, cy + 84], outline=(200, 168, 80, 255), width=1)

base.save('scratch/offer_badge_blank.png')
print('Blank template saved')
