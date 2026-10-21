from PIL import Image

banner = Image.open('public/hero_banner_unnoto_khabar.png').convert('RGBA')
logo_src = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792498997743_1335a7ac.png').convert('RGBA')

# 1. Top-left logo: replace orange house with 72x72 emblem
for y in range(20, 93):
    for x in range(138, 218):
        banner.putpixel((x, y), (254, 253, 249, 255))
logo_72 = logo_src.resize((72, 72), Image.Resampling.LANCZOS)
banner.alpha_composite(logo_72, (140, 20))

# 2. Phone top app bar: replace orange house with 18x18 emblem
# In phone (around x=707..728, y=66..88)
for y in range(66, 88):
    for x in range(706, 730):
        banner.putpixel((x, y), (255, 255, 255, 255))
logo_18 = logo_src.resize((19, 19), Image.Resampling.LANCZOS)
banner.alpha_composite(logo_18, (709, 68))

# 3. Basket logo: replace orange house with 30x30 emblem
# In basket: orange house was around x=568..600, y=390..414
for y in range(388, 415):
    for x in range(565, 603):
        banner.putpixel((x, y), (42, 44, 46, 255))
logo_30 = logo_src.resize((28, 28), Image.Resampling.LANCZOS)
# Subtle -3 deg tilt for 3D perspective
logo_30_rot = logo_30.rotate(-3.0, resample=Image.BICUBIC, expand=True)
banner.alpha_composite(logo_30_rot, (570, 388))

# Save
banner.save('scratch/crops/banner_with_official_emblem.png')
banner.crop((680, 50, 840, 105)).save('scratch/crops/check_phone_emblem.png')
banner.crop((510, 380, 640, 450)).save('scratch/crops/check_basket_emblem.png')
print('All logo replacements tested!')
