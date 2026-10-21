from PIL import Image

logo = Image.open('public/logo_uk_v2.png').convert('RGBA')
w, h = logo.size

# Option A: Pristine Pure White Typography for dark footer
logo_white = logo.copy()
for y in range(h):
    for x in range(w):
        r, g, b, a = logo_white.getpixel((x, y))
        if a > 20:
            if x >= 315:
                # Turn text into crisp pure white, preserving original alpha antialiasing
                logo_white.putpixel((x, y), (255, 255, 255, a))

# Option B: Warm Platinum / Subtle Gold Typography
logo_gold = logo.copy()
for y in range(h):
    for x in range(w):
        r, g, b, a = logo_gold.getpixel((x, y))
        if a > 20:
            if x >= 315:
                # Warm gold/amber white: (255, 245, 220)
                logo_gold.putpixel((x, y), (255, 242, 210, a))

# Test both on #041f1e footer background
bg_dark = (4, 31, 30) # #041f1e
comp_white = Image.new('RGB', (860, 260), bg_dark)
comp_white.paste(logo_white, (35, 25), logo_white)
comp_white.save('scratch/footer_comp_white.png')

comp_gold = Image.new('RGB', (860, 260), bg_dark)
comp_gold.paste(logo_gold, (35, 25), logo_gold)
comp_gold.save('scratch/footer_comp_gold.png')

logo_white.save('public/logo_uk_footer.png')
print('Done!')
