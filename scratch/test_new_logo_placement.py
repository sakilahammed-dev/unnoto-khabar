from PIL import Image

banner = Image.open('public/hero_banner_unnoto_khabar.png').convert('RGBA')
logo_src = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792498997743_1335a7ac.png').convert('RGBA')

# 1. Clean old orange house logo area: x=140..216, y=20..92
for y in range(20, 93):
    for x in range(138, 218):
        banner.putpixel((x, y), (254, 253, 249, 255))

# 2. Resize new logo to 72x72
logo_72 = logo_src.resize((72, 72), Image.Resampling.LANCZOS)

# 3. Paste at (140, 20)
banner.alpha_composite(logo_72, (140, 20))

# 4. Save crop to inspect
crop = banner.crop((120, 10, 470, 105))
crop.save('scratch/crops/test_new_logo_on_banner.png')
print('New logo crop saved!')
