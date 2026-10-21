import math
import os
from PIL import Image, ImageDraw, ImageFilter

def build_banner_v5():
    # 1. Load v4 clean master banner (which already has the clean background, corner logo, headline, CTA button, basket plaque with official logo, and phone header)
    base = Image.open('public/hero_banner_unnoto_khabar_v4.png').convert('RGBA')
    bw, bh = base.size  # 1024 x 572
    print(f"Loaded master v4 banner: {bw}x{bh}")

    # 2. Load the 4 extracted high-res circular emblems from user upload
    c_nuts = Image.open('scratch/honey_nuts_circle.png')
    c_honey = Image.open('scratch/honey_circle.png')
    c_oil = Image.open('scratch/black_seed_oil_circle.png')
    c_dates = Image.open('scratch/dates_circle.png')

    # Order matches user upload exactly: হানি নাট, মধু, কালোজিরা তেল, খেজুর
    circles_user = [c_nuts, c_honey, c_oil, c_dates]

    # Perfectly spaced below the 'এখনি অর্ডার করুন ➔' CTA button
    size = 84
    start_x = 42
    gap = 24
    y_pos = 432

    for i, c in enumerate(circles_user):
        x = start_x + i * (size + gap)
        c_resized = c.resize((size, size), Image.Resampling.LANCZOS)
        
        # Soft realistic drop shadow under each circle
        shadow = Image.new('RGBA', (size + 14, size + 14), (0, 0, 0, 0))
        ds = ImageDraw.Draw(shadow)
        ds.ellipse([(4, 5), (size + 5, size + 6)], fill=(0, 0, 0, 65))
        shadow = shadow.filter(ImageFilter.GaussianBlur(3.5))
        
        base.alpha_composite(shadow, (x - 2, y_pos - 1))
        base.alpha_composite(c_resized, (x, y_pos))

    # Save as v5 to guarantee immediate cache-invalidation
    out_file = 'public/hero_banner_unnoto_khabar_v5.png'
    base.save(out_file, format='PNG')
    print(f"Master banner v5 saved to {out_file}")

    # Also save verification crops
    base.crop((30, 410, 460, 535)).save('scratch/crops/v5_four_circles_crop.png')
    base.save('scratch/crops/v5_full_preview.png')
    print("Verification crops saved successfully!")

if __name__ == '__main__':
    build_banner_v5()
