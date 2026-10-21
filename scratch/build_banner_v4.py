import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def get_ambassador_start_x(y):
    if y < 80:
        return 515
    elif y < 140:
        return 510
    elif y < 190:
        return 490
    elif y < 240:
        t = (y - 190) / (240 - 190)
        return int(485 * (1 - t) + 465 * t)
    elif y < 280:
        t = (y - 240) / (280 - 240)
        return int(465 * (1 - t) + 448 * t)
    elif y < 340:
        t = (y - 280) / (340 - 280)
        return int(448 * (1 - t) + 438 * t)
    elif y < 390:
        t = (y - 340) / (390 - 340)
        return int(438 * (1 - t) + 482 * t)
    else:
        return 485

def build_banner_v4():
    # 1. Load source assets
    src_path = '/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792502945948_33c7262f.png'
    banner = Image.open(src_path).convert('RGBA')
    bw, bh = banner.size  # 1024 x 572
    print(f"Loaded base image: {bw}x{bh}")

    logo_official = Image.open('public/logo_uk_official.png').convert('RGBA')
    headline_clean = Image.open('scratch/headline_isolated_ultra.png').convert('RGBA')

    # =========================================================================
    # STEP 1: CONTOUR-PERFECT BACKGROUND CLEANING
    # =========================================================================
    # Seamless vertical studio gradient sampled from x=15, cleaning every single pixel
    # from x=0 right up to the ambassador's garment with a 6px anti-aliased edge.
    clean_banner = banner.copy()
    for y in range(bh):
        c = banner.getpixel((15, y))
        amb_x = get_ambassador_start_x(y)
        clean_limit = amb_x - 6
        for x in range(amb_x):
            if x < clean_limit:
                clean_banner.putpixel((x, y), c)
            else:
                t = (x - clean_limit) / 6.0
                p = banner.getpixel((x, y))
                r = int(c[0] * (1 - t) + p[0] * t)
                g = int(c[1] * (1 - t) + p[1] * t)
                b = int(c[2] * (1 - t) + p[2] * t)
                clean_banner.putpixel((x, y), (r, g, b, 255))

    banner = clean_banner

    # =========================================================================
    # STEP 2: PLACE OFFICIAL CIRCULAR EMBLEM AT FAR TOP-LEFT CORNER
    # =========================================================================
    # Corner coords: x=30, y=20
    # Size: 84x84
    logo_corner = logo_official.resize((84, 84), Image.Resampling.LANCZOS)
    banner.alpha_composite(logo_corner, (30, 20))

    # =========================================================================
    # STEP 3: PLACE SHIFTED HEADLINE ('উন্নত খাবার সুস্থ জীবনের সমাহার')
    # =========================================================================
    # Shifted UP and slightly towards center: x=62, y=85
    banner.alpha_composite(headline_clean, (62, 85))

    # =========================================================================
    # STEP 4: RENDER 'এখনি অর্ডার করুন ➔' CTA BUTTON BELOW 'সমাহার'
    # =========================================================================
    # Position: x=118, y=346 (width 230, height 48)
    btn_x, btn_y = 118, 346
    btn_w, btn_h = 230, 48

    # Soft drop shadow
    btn_shadow = Image.new('RGBA', (btn_w + 24, btn_h + 24), (0, 0, 0, 0))
    ds = ImageDraw.Draw(btn_shadow)
    ds.rounded_rectangle([(10, 10), (btn_w + 12, btn_h + 12)], radius=24, fill=(0, 0, 0, 70))
    btn_shadow = btn_shadow.filter(ImageFilter.GaussianBlur(5))
    banner.alpha_composite(btn_shadow, (btn_x - 5, btn_y - 2))

    # Gradient pill button (Warm Amber #ea580c to Rich Crimson #dc2626)
    btn = Image.new('RGBA', (btn_w, btn_h), (0, 0, 0, 0))
    d_btn = ImageDraw.Draw(btn)
    for y in range(btn_h):
        t = y / btn_h
        r = int(245 * (1 - t) + 215 * t)
        g = int(105 * (1 - t) + 32 * t)
        b = int(18 * (1 - t) + 12 * t)
        d_btn.line([(0, y), (btn_w, y)], fill=(r, g, b, 255))

    btn_mask = Image.new('L', (btn_w, btn_h), 0)
    ImageDraw.Draw(btn_mask).rounded_rectangle([(0, 0), (btn_w - 1, btn_h - 1)], radius=24, fill=255)

    # Metallic gold outline
    border = Image.new('RGBA', (btn_w, btn_h), (0, 0, 0, 0))
    ImageDraw.Draw(border).rounded_rectangle([(0, 0), (btn_w - 1, btn_h - 1)], radius=24, outline=(255, 235, 175, 220), width=2)

    btn_final = Image.new('RGBA', (btn_w, btn_h), (0, 0, 0, 0))
    btn_final.paste(btn, (0, 0), mask=btn_mask)
    btn_final.alpha_composite(border)

    # Bengali Text: 'এখনি অর্ডার করুন'
    font_cta = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 21)
    d_txt = ImageDraw.Draw(btn_final)
    cta_text = 'এখনি অর্ডার করুন'
    bbox = d_txt.textbbox((0, 0), cta_text, font=font_cta)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    total_content_w = tw + 26
    start_x = (btn_w - total_content_w) // 2
    text_y = (btn_h - th) // 2 - 3

    # Text shadow & crisp white text
    d_txt.text((start_x + 1, text_y + 2), cta_text, font=font_cta, fill=(0, 0, 0, 120))
    d_txt.text((start_x, text_y), cta_text, font=font_cta, fill=(255, 255, 255, 255))

    # Crisp white vector arrow
    arrow_x = start_x + tw + 10
    arrow_y = btn_h // 2
    d_txt.line([(arrow_x, arrow_y), (arrow_x + 10, arrow_y)], fill=(255, 255, 255, 255), width=3)
    d_txt.polygon([(arrow_x + 8, arrow_y - 6), (arrow_x + 16, arrow_y), (arrow_x + 8, arrow_y + 6)], fill=(255, 255, 255, 255))

    banner.alpha_composite(btn_final, (btn_x, btn_y))

    # =========================================================================
    # STEP 5: BASKET FRONT PANEL - EMBED OFFICIAL CIRCULAR LOGO PLAQUE
    # =========================================================================
    pw, ph = 100, 96
    plaque = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
    dp = ImageDraw.Draw(plaque)

    # Matte charcoal plaque with rounded corners and subtle bevel
    dp.rounded_rectangle([(0, 0), (pw - 1, ph - 1)], radius=7, fill=(38, 40, 43, 255), outline=(58, 62, 66, 255), width=2)

    # Place circular logo on upper half
    logo_resized = logo_official.resize((54, 54), Image.Resampling.LANCZOS)
    plaque.alpha_composite(logo_resized, ((pw - 54) // 2, 6))

    # Text 'উন্নত খাবার' in white below logo
    font_basket = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 16)
    tb = dp.textbbox((0, 0), 'উন্নত খাবার', font=font_basket)
    tw_b = tb[2] - tb[0]
    dp.text(((pw - tw_b) // 2, 64), 'উন্নত খাবার', font=font_basket, fill=(255, 255, 255, 250))

    # Rotate plaque by -4.5 degrees to match basket angle
    plaque_rot = plaque.rotate(-4.5, resample=Image.BICUBIC, expand=True)

    # Soft realistic shadow
    shadow_b = Image.new('RGBA', (plaque_rot.width + 6, plaque_rot.height + 6), (0, 0, 0, 0))
    ImageDraw.Draw(shadow_b).bitmap((3, 3), plaque_rot.getchannel('A'), fill=(0, 0, 0, 80))
    shadow_b = shadow_b.filter(ImageFilter.GaussianBlur(3))

    basket_pos_x = 554
    basket_pos_y = 455
    banner.alpha_composite(shadow_b, (basket_pos_x - 3, basket_pos_y - 2))
    banner.alpha_composite(plaque_rot, (basket_pos_x, basket_pos_y))

    # =========================================================================
    # STEP 6: PHONE HEADER - REPLACE WITH OFFICIAL LOGO & 'উন্নত খাবার'
    # =========================================================================
    # Clear phone header: x=740..874, y=80..110 to white
    for y in range(80, 110):
        for x in range(740, 874):
            banner.putpixel((x, y), (255, 255, 255, 255))

    logo_phone = logo_official.resize((25, 25), Image.Resampling.LANCZOS)
    banner.alpha_composite(logo_phone, (746, 83))

    font_phone = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 15)
    d_phone = ImageDraw.Draw(banner)
    d_phone.text((776, 85), 'উন্নত খাবার', font=font_phone, fill=(8, 72, 24, 255))

    # =========================================================================
    # STEP 7: SAVE MASTER BANNER V4
    # =========================================================================
    out_file = 'public/hero_banner_unnoto_khabar_v4.png'
    banner.save(out_file, format='PNG')
    print(f"Master banner saved to {out_file}")

    # Save verification crops
    banner.crop((0, 0, 480, 120)).save('scratch/crops/v4_top_left.png')
    banner.crop((0, 60, 480, 420)).save('scratch/crops/v4_headline_cta.png')
    banner.crop((500, 420, 680, 565)).save('scratch/crops/v4_basket_logo.png')
    banner.crop((730, 70, 900, 120)).save('scratch/crops/v4_phone_header.png')
    banner.save('scratch/crops/v4_full_preview.png')
    print("All verification crops saved!")

if __name__ == '__main__':
    build_banner_v4()
