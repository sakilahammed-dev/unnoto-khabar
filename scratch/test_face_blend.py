from PIL import Image, ImageDraw, ImageFilter

# Load source face (from original banner)
orig_face = Image.open('scratch/crops/orig_character_face.png').convert('RGBA')
# Target image: honey banner
target = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/unnoto_khabar_honey_banner_1792490821020.jpg').convert('RGBA')

# Target head is in x=880..1120, y=50..340
# Let's crop target head to measure
target_head = target.crop((880, 50, 1120, 340))
tw, th = target_head.size
print('Target head size:', tw, th)

# Resize orig_face to match target head scale
# orig_face is (120, 190) -> target head is approx 240x290
scaled_face = orig_face.resize((int(orig_face.width * 1.6), int(orig_face.height * 1.6)), Image.Resampling.LANCZOS)
print('Scaled face size:', scaled_face.size)

# Create an elliptical feather mask for the face (avoiding edges)
sw, sh = scaled_face.size
mask = Image.new('L', (sw, sh), 0)
dm = ImageDraw.Draw(mask)
# Ellipse covering forehead, eyes, nose, cheeks, beard
dm.ellipse([(15, 10), (sw - 15, sh - 10)], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(12))

# Composite scaled face onto target at head position
test_composite = target.copy()
# Head center in target: around x=920, y=55
test_composite.paste(scaled_face, (925, 55), mask=mask)
test_composite.crop((850, 40, 1150, 370)).save('scratch/crops/test_face_swap_honey.png')
print('Face swap test saved')
