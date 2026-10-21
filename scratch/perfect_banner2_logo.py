from PIL import Image, ImageDraw, ImageFilter

# Load pristine raw image
raw_path = '/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792505913972_d4c9f69d.jpg'
base = Image.open(raw_path).convert('RGBA')

# Center of old circle
cx, cy = 94.5, 74.5

# Step 1: Inpaint strictly INSIDE the boundary so no halo spills outside
# Radius of inpaint: 64 px
# Fill with dark forest green matching surrounding foliage
inpaint_radius = 64
inpaint_mask = Image.new('L', base.size, 0)
idraw = ImageDraw.Draw(inpaint_mask)
idraw.ellipse([cx - inpaint_radius, cy - inpaint_radius, cx + inpaint_radius, cy + inpaint_radius], fill=255)
inpaint_mask = inpaint_mask.filter(ImageFilter.GaussianBlur(2))

# Create deep foliage green fill
foliage_patch = Image.new('RGBA', base.size, (35, 52, 28, 255))
base.paste(foliage_patch, (0, 0), inpaint_mask)

# Save intermediate to check inpaint
base.crop((0, 0, 300, 300)).save('scratch/banner2_inpaint_clean2.png')

# Step 2: Overlay official logo
# Radius 68 px -> Diameter 136 px (completely overlaps inpaint_radius 64 by 4px on every side)
logo = Image.open('public/logo_uk_official.png').convert('RGBA')
logo_size = 136
logo_resized = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

# Position exactly centered at (cx, cy)
logo_x = int(round(cx - logo_size / 2))
logo_y = int(round(cy - logo_size / 2))

# Subtle natural soft drop shadow
shadow = Image.new('RGBA', (logo_size + 12, logo_size + 12), (0, 0, 0, 0))
sdraw = ImageDraw.Draw(shadow)
sdraw.ellipse([6, 6, logo_size + 6, logo_size + 6], fill=(0, 0, 0, 150))
shadow = shadow.filter(ImageFilter.GaussianBlur(4))

# Paste shadow then logo
base.paste(shadow, (logo_x - 6, logo_y - 4), shadow)
base.paste(logo_resized, (logo_x, logo_y), logo_resized)

# Save final files
base.convert('RGB').save('public/hero_banner_sundarban_honey_v2.jpg', quality=95)
base.save('public/hero_banner_sundarban_honey_v2.png')

# Save crop for inspection
base.crop((0, 0, 300, 300)).save('scratch/banner2_v2_perfect_corner2.png')
print('Finished!')
