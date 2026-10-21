from PIL import Image

src_banner = 'public/hero_banner_unnoto_khabar.png'
banner = Image.open(src_banner).convert('RGBA')

logo_path = '/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792498997743_1335a7ac.png'
logo_src = Image.open(logo_path).convert('RGBA')

# Save official logo to public folder for website use
logo_src.save('public/logo_uk_official.png')

# 1. Clean old orange house logo area: x=138..218, y=18..93
# Background is smooth cream gradient
for y in range(18, 94):
    for x in range(138, 219):
        # sample smooth background color
        banner.putpixel((x, y), (254, 253, 249, 255))

# 2. Resize new circular emblem to 72x72
logo_72 = logo_src.resize((72, 72), Image.Resampling.LANCZOS)

# 3. Paste at (140, 20)
banner.alpha_composite(logo_72, (140, 20))

banner.save('public/hero_banner_unnoto_khabar.png')
print('Updated banner saved successfully!')
