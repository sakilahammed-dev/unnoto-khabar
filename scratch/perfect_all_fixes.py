from PIL import Image, ImageDraw, ImageFont, ImageFilter

src_path = '/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792487959384_dda70957.png'
img = Image.open(src_path).convert('RGBA')

# =========================================================================
# 1. TOP-LEFT LOGO: Replace ONLY 'কভার' with 'খাবার' (Preserve original 'উন্নত' & (R))
# =========================================================================
# Clean old 'কভার' area: x=324 to 455, y=25 to 83
for x in range(324, 456):
    c_top = img.getpixel((x, 15))
    c_bot = img.getpixel((x, 85))
    for y in range(24, 84):
        ty = (y - 15) / (85 - 15)
        r = int(c_top[0] * (1 - ty) + c_bot[0] * ty)
        g = int(c_top[1] * (1 - ty) + c_bot[1] * ty)
        b = int(c_top[2] * (1 - ty) + c_bot[2] * ty)
        img.putpixel((x, y), (r, g, b, 255))

# Draw 'খাবার' right after 'উন্নত'
font_logo = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 38)
draw = ImageDraw.Draw(img)
# In orig_top_logo, 'উন্নত' matra ends at x=324, y=36.
# Draw 'খাবার' at x=323, y=30
draw.text((323, 30), "খাবার", font=font_logo, fill=(8, 72, 24, 255))

# =========================================================================
# 2. MAIN HEADLINE: Connect 'খাবার' seamlessly with 'উন্নত'
# =========================================================================
# Clean old 'কভার' area: x=250 to 482, y=90 to 184
for y in range(90, 184):
    c_left = img.getpixel((248, y))
    for x in range(250, 485):
        t = (x - 250) / (485 - 250)
        r = int(c_left[0] * (1 - t) + 254 * t)
        g = int(c_left[1] * (1 - t) + 244 * t)
        b = int(c_left[2] * (1 - t) + 218 * t)
        img.putpixel((x, y), (r, g, b, 255))

font_main = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 72)
txt_w, txt_h = 280, 130
txt_layer = Image.new('RGBA', (txt_w, txt_h), (0, 0, 0, 0))

# Drop Shadow
shadow = Image.new('RGBA', (txt_w, txt_h), (0, 0, 0, 0))
ds = ImageDraw.Draw(shadow)
ds.text((12, 14), 'খাবার', font=font_main, fill=(0, 0, 0, 95), stroke_width=6, stroke_fill=(0, 0, 0, 95))
shadow = shadow.filter(ImageFilter.GaussianBlur(2.5))
txt_layer.alpha_composite(shadow)

# Thick White outline
d_stroke = ImageDraw.Draw(txt_layer)
d_stroke.text((10, 10), 'খাবার', font=font_main, fill=(255, 255, 255, 255), stroke_width=7, stroke_fill=(255, 255, 255, 255))

# Gradient fill layer
fill_layer = Image.new('RGBA', (txt_w, txt_h), (0, 0, 0, 0))
d_mask = ImageDraw.Draw(fill_layer)
d_mask.text((10, 10), 'খাবার', font=font_main, fill=(255, 255, 255, 255))

grad = Image.new('RGBA', (txt_w, txt_h))
for y in range(txt_h):
    t = y / txt_h
    gr = int(18 * (1 - t) + 6 * t)
    gg = int(122 * (1 - t) + 65 * t)
    gb = int(26 * (1 - t) + 16 * t)
    for x in range(txt_w):
        grad.putpixel((x, y), (gr, gg, gb, 255))

txt_layer.paste(grad, (0, 0), mask=fill_layer.getchannel('A'))

txt_rot = txt_layer.rotate(-1.5, resample=Image.BICUBIC, expand=True)
img.alpha_composite(txt_rot, (260, 87))

# =========================================================================
# 3. BASKET LABEL: Perfectly clean dark plate & write 'উন্নত খাবার'
# =========================================================================
# Basket area: global coordinates
# In global coordinates:
# x=530 to 625, y=412 to 445
for y in range(412, 446):
    for x in range(530, 625):
        # subtle dark gradient from top to bottom
        ty = (y - 412) / (446 - 412)
        v = int(48 * (1 - ty) + 36 * ty)
        img.putpixel((x, y), (v, v+2, v+4, 255))

font_basket = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
b_layer = Image.new('RGBA', (120, 30), (0, 0, 0, 0))
db = ImageDraw.Draw(b_layer)
db.text((2, 2), "উন্নত খাবার", font=font_basket, fill=(255, 255, 255, 235))
# Tilted to match basket plane: -3.5 degrees
b_rot = b_layer.rotate(-3.5, resample=Image.BICUBIC, expand=True)
img.alpha_composite(b_rot, (532, 417))

# =========================================================================
# 4. PHONE HEADER: Replace ONLY 'কভার' with 'খাবার'
# =========================================================================
# 'কভার' in phone app: x=772 to 825, y=67 to 86
for y in range(67, 87):
    for x in range(772, 825):
        img.putpixel((x, y), (255, 255, 255, 255))

font_phone = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
draw.text((773, 69), "খাবার", font=font_phone, fill=(8, 72, 24, 255))

# Save output
out_file = '/home/assdi/My Drive/Web Pure Food/public/hero_banner_unnoto_khabar.png'
img.save(out_file, format='PNG')
print('Perfect banner saved to', out_file)

# Save crops
img.crop((120, 20, 480, 90)).save('scratch/crops/p_top_logo.png')
img.crop((30, 80, 485, 250)).save('scratch/crops/p_main_title.png')
img.crop((510, 390, 640, 460)).save('scratch/crops/p_basket.png')
img.crop((680, 50, 840, 105)).save('scratch/crops/p_phone_top.png')
print('All 4 perfection crops saved!')
