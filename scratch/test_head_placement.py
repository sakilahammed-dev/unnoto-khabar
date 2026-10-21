from PIL import Image, ImageDraw, ImageFilter

# 1. Original head with neck and cap from original banner
orig_banner = Image.open('public/hero_banner_unnoto_khabar.png').convert('RGBA')
# In public/hero_banner_unnoto_khabar.png, the man is:
# Head: x=475..610, y=55..235
orig_head = orig_banner.crop((475, 55, 610, 235))
orig_head.save('scratch/crops/clean_orig_head.png')

# 2. Suit banner:
honey_banner = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/unnoto_khabar_honey_banner_1792490821020.jpg').convert('RGBA')

# In honey_banner (1376x768):
# The old head is at x=890..1060, y=50..340
# The collar is at x=930..1020, y=320..360
# If we clear the old head by extending the blurred nature background:
# Or if we paste orig_head scaled by 1.6:
scale = 1.62
scaled_orig_head = orig_head.resize((int(orig_head.width * scale), int(orig_head.height * scale)), Image.Resampling.LANCZOS)
print('Scaled head:', scaled_orig_head.size)

# Create a clean mask around the head
hw, hh = scaled_orig_head.size
mask = Image.new('L', (hw, hh), 0)
d = ImageDraw.Draw(mask)
# Ellipse / polygon covering tupi, face, ears, beard
d.polygon([
    (40, 20), (hw - 40, 20), (hw - 10, 80), (hw - 10, 160),
    (hw - 20, 240), (hw // 2, hh - 10), (20, 240), (10, 160), (10, 80)
], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(8))

test_img = honey_banner.copy()
# Paste at (865, 50)
test_img.paste(scaled_orig_head, (865, 50), mask=mask)
test_img.crop((750, 20, 1200, 450)).save('scratch/crops/test_honey_clean_head.png')
print('Honey clean head test saved')
