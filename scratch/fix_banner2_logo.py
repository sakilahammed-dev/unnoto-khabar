from PIL import Image, ImageDraw, ImageFilter
import math

# Load raw image
raw_path = '/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792505913972_d4c9f69d.jpg'
base = Image.open(raw_path).convert('RGBA')

# Also inspect surrounding forest background to inpaint
# Let's clone background texture from adjacent tree foliage (e.g. from x: 0..60, y: 0..200 and x: 160..240, y: 0..150)
# Create a patch mask for the old circle
mask = Image.new('L', base.size, 0)
draw = ImageDraw.Draw(mask)
cx, cy = 95, 75
radius = 75  # covers 150px diameter completely

draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=255)
# Feather the mask slightly
mask_feathered = mask.filter(ImageFilter.GaussianBlur(5))

# Create an inpaint texture by taking foliage from nearby areas
# Left foliage x: 0..40, right foliage x: 170..240
# We can also blur and blend deep forest colors
inpaint_bg = base.copy()
# Sample foliage colors: average dark green forest
for y in range(max(0, cy - radius - 10), min(base.height, cy + radius + 10)):
    for x in range(max(0, cx - radius - 10), min(base.width, cx + radius + 10)):
        dist = math.hypot(x - cx, y - cy)
        if dist <= radius + 5:
            # Pick texture from foliage nearby (e.g., offset x by +100 or -70 if valid)
            sample_x = min(base.width - 1, x + 90)
            sample_y = min(base.height - 1, y)
            inpaint_bg.putpixel((x, y), base.getpixel((sample_x, sample_y)))

# Blur the inpaint slightly so there are no seams
inpaint_bg_blurred = inpaint_bg.filter(ImageFilter.GaussianBlur(3))
base.paste(inpaint_bg_blurred, (0, 0), mask_feathered)

# Now, base has ZERO traces of the old logo!
# Save an intermediate to check the inpaint
base.crop((0, 0, 250, 250)).save('scratch/banner2_inpaint_check.png')
print('Inpaint check saved')

# Now load official circular logo
logo = Image.open('public/logo_uk_official.png').convert('RGBA')

# Target diameter: 128px (radius 64)
# Center at (cx, cy) = (95, 75)
logo_size = 130
logo_resized = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

# Create a subtle soft ambient drop shadow behind logo for maximum contrast and pop against leaves
shadow_size = logo_size + 16
shadow = Image.new('RGBA', (shadow_size, shadow_size), (0, 0, 0, 0))
sdraw = ImageDraw.Draw(shadow)
s_offset = 8
sdraw.ellipse([s_offset, s_offset + 2, shadow_size - s_offset, shadow_size - s_offset + 2], fill=(0, 0, 0, 140))
shadow = shadow.filter(ImageFilter.GaussianBlur(6))

# Composite shadow
shadow_x = cx - shadow_size // 2
shadow_y = cy - shadow_size // 2
base.paste(shadow, (shadow_x, shadow_y), shadow)

# Composite resized logo
logo_x = cx - logo_size // 2
logo_y = cy - logo_size // 2
base.paste(logo_resized, (logo_x, logo_y), logo_resized)

# Save result
final_rgb = base.convert('RGB')
final_rgb.save('public/hero_banner_sundarban_honey_v2.jpg', quality=95)
base.save('public/hero_banner_sundarban_honey_v2.png')

# Save crop of final corner to check
base.crop((0, 0, 300, 300)).save('scratch/banner2_v2_corner_check.png')
print('Final banner 2 saved successfully!')
