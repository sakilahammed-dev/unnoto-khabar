import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

# 1. Load source assets
src_banner = 'public/hero_banner_unnoto_khabar_v2.png'
banner = Image.open(src_banner).convert('RGBA')
bw, bh = banner.size # 1024 x 473

logo_official = Image.open('public/logo_uk_official.png').convert('RGBA')
thobe_sample = Image.open('scratch/crops/clean_white_thobe_sample.png').convert('RGBA')

# =========================================================================
# STEP 1: PREPARE SEAMLESS CLEAN BACKGROUND PLATE FOR LEFT HALF
# =========================================================================
# The background on the left is a smooth vertical studio gradient matching x=15.
# Fill x=25..450, y=10..375 seamlessly without any rectangular artifact.
clean_plate = banner.copy()
for y in range(10, 375):
    c = banner.getpixel((15, y))
    for x in range(25, 452):
        if x > 436:
            t = (x - 436) / (452 - 436)
            orig_p = banner.getpixel((x, y))
            r = int(c[0] * (1 - t) + orig_p[0] * t)
            g = int(c[1] * (1 - t) + orig_p[1] * t)
            b = int(c[2] * (1 - t) + orig_p[2] * t)
            clean_plate.putpixel((x, y), (r, g, b, 255))
        else:
            clean_plate.putpixel((x, y), c)

banner = clean_plate

# =========================================================================
# STEP 2: SHIFT MAIN HEADLINE UP BY ~30PX (USING PRECISE TEXT ALPHA MASK)
# =========================================================================
# In public/hero_banner_unnoto_khabar_v2.png, crop strictly x=40..465, y=94..335
orig_banner = Image.open(src_banner).convert('RGBA')
crop = orig_banner.crop((40, 94, 465, 335))
cw, ch = crop.size

# Build precise alpha mask isolating text, leaves, outline, and shadows from background
mask = Image.new('L', (cw, ch), 0)
for y in range(ch):
    ty = y / ch
    for x in range(cw):
        tx = x / cw
        bg_r = 254
        bg_g = int((254 * (1 - ty) + 249 * ty) * (1 - tx) + (244 * (1 - ty) + 235 * ty) * tx)
        bg_b = int((251 * (1 - ty) + 237 * ty) * (1 - tx) + (221 * (1 - ty) + 198 * ty) * tx)
        
        p = crop.getpixel((x, y))
        diff = abs(p[0] - bg_r) + abs(p[1] - bg_g) + abs(p[2] - bg_b)
        
        if diff < 10:
            alpha = 0
        elif diff > 30:
            alpha = 255
        else:
            alpha = int(255 * ((diff - 10) / 20))
        mask.putpixel((x, y), alpha)

mask = mask.filter(ImageFilter.GaussianBlur(1.2))

# Paste shifted up by 30px: from y=94 to y=64 using the alpha mask
banner.paste(crop, (40, 64), mask=mask)

# =========================================================================
# STEP 3: PLACE OFFICIAL CIRCULAR EMBLEM AT TOP-LEFT CORNER
# =========================================================================
# Corner coords: x=45, y=18
# Size: 76x76
logo_corner = logo_official.resize((76, 76), Image.Resampling.LANCZOS)
banner.alpha_composite(logo_corner, (45, 18))

# =========================================================================
# STEP 4: RENDER 'এখনি অর্ডার করুন' CTA BUTTON BELOW 'সমাহার'
# =========================================================================
# 'সমাহার' ends at y = 64 + (335 - 94) = 305
# CTA button position: x=115, y=315 (width 230, height 46)
btn_x, btn_y = 115, 315
btn_w, btn_h = 230, 46

# Soft drop shadow
btn_shadow = Image.new('RGBA', (btn_w + 20, btn_h + 20), (0, 0, 0, 0))
ds = ImageDraw.Draw(btn_shadow)
ds.rounded_rectangle([(8, 8), (btn_w + 10, btn_h + 10)], radius=23, fill=(0, 0, 0, 65))
btn_shadow = btn_shadow.filter(ImageFilter.GaussianBlur(4))
banner.alpha_composite(btn_shadow, (btn_x - 4, btn_y - 2))

# Vibrant rounded pill button: Amber-Orange (#ea580c) to Crimson-Red (#dc2626)
btn = Image.new('RGBA', (btn_w, btn_h), (0, 0, 0, 0))
d_btn = ImageDraw.Draw(btn)
for y in range(btn_h):
    t = y / btn_h
    r = int(245 * (1 - t) + 215 * t)
    g = int(105 * (1 - t) + 32 * t)
    b = int(18 * (1 - t) + 12 * t)
    d_btn.line([(0, y), (btn_w, y)], fill=(r, g, b, 255))

btn_mask = Image.new('L', (btn_w, btn_h), 0)
ImageDraw.Draw(btn_mask).rounded_rectangle([(0, 0), (btn_w - 1, btn_h - 1)], radius=23, fill=255)

# Metallic gold outline
border = Image.new('RGBA', (btn_w, btn_h), (0, 0, 0, 0))
ImageDraw.Draw(border).rounded_rectangle([(0, 0), (btn_w - 1, btn_h - 1)], radius=23, outline=(255, 235, 175, 220), width=2)

btn_final = Image.new('RGBA', (btn_w, btn_h), (0, 0, 0, 0))
btn_final.paste(btn, (0, 0), mask=btn_mask)
btn_final.alpha_composite(border)

# Bengali Text: 'এখনি অর্ডার করুন'
font_cta = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 20)
d_txt = ImageDraw.Draw(btn_final)
cta_text = 'এখনি অর্ডার করুন'
bbox = d_txt.textbbox((0, 0), cta_text, font=font_cta)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]

# Position text and arrow centered:
total_content_w = tw + 24
start_x = (btn_w - total_content_w) // 2
text_y = (btn_h - th) // 2 - 3

# Text drop shadow & fill
d_txt.text((start_x + 1, text_y + 2), cta_text, font=font_cta, fill=(0, 0, 0, 110))
d_txt.text((start_x, text_y), cta_text, font=font_cta, fill=(255, 255, 255, 255))

# Draw crisp white vector arrow:
arrow_x = start_x + tw + 8
arrow_y = btn_h // 2
d_txt.line([(arrow_x, arrow_y), (arrow_x + 10, arrow_y)], fill=(255, 255, 255, 255), width=3)
d_txt.polygon([(arrow_x + 8, arrow_y - 5), (arrow_x + 15, arrow_y), (arrow_x + 8, arrow_y + 5)], fill=(255, 255, 255, 255))

banner.alpha_composite(btn_final, (btn_x, btn_y))

# =========================================================================
# STEP 5: REMOVE BASKET & RECONSTRUCT CRISP CLEAN PANJABI
# =========================================================================
pure_fabric = thobe_sample.crop((60, 15, 260, 135))
enhancer_b = ImageEnhance.Brightness(pure_fabric)
pure_fabric = enhancer_b.enhance(0.975)
enhancer_c = ImageEnhance.Contrast(pure_fabric)
pure_fabric = enhancer_c.enhance(1.02)

# Size: width 200 (x=492..692), height 255 (y=220..475)
fabric_scaled = pure_fabric.resize((200, 255), Image.Resampling.LANCZOS)
f_mask = Image.new('L', (200, 255), 255)

# Smooth top ease-in-out feather (y=0 to 50)
for y in range(50):
    alpha = int(255 * (1 - math.cos(math.pi * y / 50)) / 2)
    for x in range(200):
        f_mask.putpixel((x, y), alpha)

# Smooth left feather (blend into existing panjabi at x=492..515)
for x in range(25):
    alpha = int(255 * (x / 25))
    for y in range(255):
        cur = f_mask.getpixel((x, y))
        f_mask.putpixel((x, y), min(cur, alpha))

# Protect placket buttons at top-left: x=18..42, y=0..65
for y in range(65):
    for x in range(15, 45):
        f_mask.putpixel((x, y), 0)

f_mask = f_mask.filter(ImageFilter.GaussianBlur(2.5))
banner.paste(fabric_scaled, (492, 220), mask=f_mask)

# =========================================================================
# STEP 6: REPLACE PHONE SCREEN HEADER LOGO WITH OFFICIAL EMBLEM
# =========================================================================
# Clear old icon: x=724..752, y=65..92
for y in range(65, 92):
    for x in range(724, 752):
        banner.putpixel((x, y), (255, 255, 255, 255))

logo_phone = logo_official.resize((24, 24), Image.Resampling.LANCZOS)
banner.alpha_composite(logo_phone, (726, 67))

# =========================================================================
# STEP 7: SAVE MASTER BANNER V3 AND CROPS FOR VERIFICATION
# =========================================================================
out_path = 'public/hero_banner_unnoto_khabar_v3.png'
banner.save(out_path, format='PNG')
print(f'Master banner saved to {out_path}')

banner.crop((30, 10, 480, 110)).save('scratch/crops/v3_top_left_corner.png')
banner.crop((30, 60, 480, 375)).save('scratch/crops/v3_headline_and_cta.png')
banner.crop((400, 140, 720, 473)).save('scratch/crops/v3_ambassador_clean.png')
banner.crop((690, 55, 840, 105)).save('scratch/crops/v3_phone_header.png')
print('All crops refreshed successfully!')
