from PIL import Image, ImageDraw, ImageFont, ImageFilter

src_path = '/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792487959384_dda70957.png'
img = Image.open(src_path).convert('RGBA')

# =========================================================================
# 1. TOP-LEFT LOGO: Replace ONLY 'কভার' with 'খাবার' (Keep 'উন্নত' & (R))
# =========================================================================
for x in range(324, 456):
    c_top = img.getpixel((x, 15))
    c_bot = img.getpixel((x, 85))
    for y in range(24, 84):
        ty = (y - 15) / (85 - 15)
        r = int(c_top[0] * (1 - ty) + c_bot[0] * ty)
        g = int(c_top[1] * (1 - ty) + c_bot[1] * ty)
        b = int(c_top[2] * (1 - ty) + c_bot[2] * ty)
        img.putpixel((x, y), (r, g, b, 255))

font_logo = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 38)
draw = ImageDraw.Draw(img)
draw.text((323, 30), "খাবার", font=font_logo, fill=(8, 72, 24, 255))

# =========================================================================
# 2. MAIN HEADLINE: Connect 'খাবার' seamlessly with 'উন্নত'
# =========================================================================
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
# 3. BASKET: Replace ONLY 'কভার' on the dark panel (Keep 'উন্নত' untouched)
# =========================================================================
# In global coords, basket crop was (510, 390).
# xc=78 to 112 -> global x = 588 to 622
# yc=22 to 49 -> global y = 412 to 439
for y in range(412, 440):
    c_l = img.getpixel((587, y))
    c_r = img.getpixel((622, y))
    for x in range(588, 622):
        t = (x - 588) / (622 - 588)
        r = int(c_l[0] * (1 - t) + c_r[0] * t)
        g = int(c_l[1] * (1 - t) + c_r[1] * t)
        b = int(c_l[2] * (1 - t) + c_r[2] * t)
        # Avoid orange trail near top
        if r > 100: r = 42
        if g > 100: g = 44
        if b > 100: b = 46
        img.putpixel((x, y), (r, g, b, 255))

font_basket = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
b_layer = Image.new('RGBA', (60, 26), (0, 0, 0, 0))
db = ImageDraw.Draw(b_layer)
db.text((1, 2), "খাবার", font=font_basket, fill=(0, 0, 0, 160))
db.text((1, 1), "খাবার", font=font_basket, fill=(255, 255, 255, 255))
b_rot = b_layer.rotate(-9.0, resample=Image.BICUBIC, expand=True)
img.alpha_composite(b_rot, (587, 411))

# =========================================================================
# 4. PHONE HEADER: Replace ONLY 'কভার' with 'খাবার' (Keep 'উন্নত' untouched)
# =========================================================================
# Global x=783 to 830, y=67 to 86
for y in range(67, 87):
    for x in range(783, 830):
        img.putpixel((x, y), (255, 255, 255, 255))

font_phone = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
draw.text((783, 69), "খাবার", font=font_phone, fill=(8, 72, 24, 255))

# Save output
out_file = '/home/assdi/My Drive/Web Pure Food/public/hero_banner_unnoto_khabar.png'
img.save(out_file, format='PNG')
print('Master banner saved to', out_file)

# Save verification crops
img.crop((120, 20, 480, 90)).save('scratch/crops/final_top_logo.png')
img.crop((30, 80, 485, 250)).save('scratch/crops/final_main_title.png')
img.crop((510, 390, 640, 460)).save('scratch/crops/final_basket.png')
img.crop((680, 50, 840, 105)).save('scratch/crops/final_phone_top.png')
print('All 4 final crops saved!')
