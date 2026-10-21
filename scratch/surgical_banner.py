from PIL import Image, ImageDraw, ImageFont, ImageFilter

src_path = '/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792487959384_dda70957.png'
img = Image.open(src_path).convert('RGBA')

# -------------------------------------------------------------------------
# 1. TOP LOGO: Only replace 'কভার' (x=330 to 455, y=26 to 82)
# -------------------------------------------------------------------------
# Background gradient in that region: smooth horizontal gradient from (255,253,250) to (254,248,230)
for y in range(25, 83):
    c_left = img.getpixel((328, y))
    c_right = img.getpixel((456, y))
    for x in range(329, 456):
        t = (x - 329) / (456 - 329)
        r = int(c_left[0] * (1 - t) + c_right[0] * t)
        g = int(c_left[1] * (1 - t) + c_right[1] * t)
        b = int(c_left[2] * (1 - t) + c_right[2] * t)
        img.putpixel((x, y), (r, g, b, 255))

font_logo = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 38)
draw = ImageDraw.Draw(img)
# Sample green color from original 'উন্নত'
orig_green = (8, 72, 24, 255)
# Place 'খাবার' right after 'উন্নত'
draw.text((330, 31), "খাবার", font=font_logo, fill=orig_green)

# Connect the matra (top bar) cleanly between 'উন্নত' and 'খাবার' if needed
# The matra of 'উন্নত' ends at x=330, y=38, thickness ~ 5px
# Let's inspect after rendering

# -------------------------------------------------------------------------
# 2. MAIN HEADLINE: Replace 'কভার' with 'খাবার' (Already proven flawless)
# -------------------------------------------------------------------------
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

# -------------------------------------------------------------------------
# 3. BASKET TEXT: Only replace 'কভার' on the dark gray plate
# -------------------------------------------------------------------------
# 'কভার' is around x=572 to 625, y=415 to 445
# Sample the dark gray color of the plate around x=570, y=420
plate_color = (42, 44, 47, 255)
# Fill only 'কভার' area with the dark gray
for y in range(412, 447):
    for x in range(572, 625):
        img.putpixel((x, y), plate_color)

font_basket = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 15)
b_layer = Image.new('RGBA', (80, 32), (0, 0, 0, 0))
db = ImageDraw.Draw(b_layer)
db.text((2, 2), "খাবার", font=font_basket, fill=(255, 255, 255, 250))
b_rot = b_layer.rotate(-2.5, resample=Image.BICUBIC, expand=True)
img.alpha_composite(b_rot, (574, 417))

# -------------------------------------------------------------------------
# 4. PHONE HEADER: Only replace 'কভার' (x=776 to 825, y=67 to 86)
# -------------------------------------------------------------------------
# Background inside phone app bar is pure white #ffffff
for y in range(67, 87):
    for x in range(775, 825):
        img.putpixel((x, y), (255, 255, 255, 255))

font_phone = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
draw.text((776, 69), "খাবার", font=font_phone, fill=(8, 72, 24, 255))

# Save output
out_file = '/home/assdi/My Drive/Web Pure Food/public/hero_banner_unnoto_khabar.png'
img.save(out_file, format='PNG')
print('Surgical banner saved to', out_file)

# Save crops
img.crop((120, 20, 480, 90)).save('scratch/crops/surg_top_logo.png')
img.crop((30, 80, 485, 250)).save('scratch/crops/surg_main_title.png')
img.crop((510, 390, 640, 460)).save('scratch/crops/surg_basket.png')
img.crop((680, 50, 840, 105)).save('scratch/crops/surg_phone_top.png')
print('Saved all surgical verification crops!')
