from PIL import Image

logo = Image.open('public/logo_uk_v2.png').convert('RGBA')

# Option 1: Direct placement on footer dark green #041f1e
bg_dark = (4, 31, 30) # #041f1e
test1 = Image.new('RGB', (850, 260), bg_dark)
test1.paste(logo, (30, 25), logo)
test1.save('scratch/footer_logo_direct.png')

# Option 2: White/bright text version for dark background
# In logo_uk_v2:
# Monogram is roughly x < 300
# Text is x >= 300. The text pixels are dark green (e.g. r < 50, g in 70..120, b < 60)
# We can turn the dark green text to crisp pure white (255, 255, 255)
# And the 'U' stroke can either stay green or be bright green or white
logo_light = logo.copy()
w, h = logo_light.size
for y in range(h):
    for x in range(w):
        r, g, b, a = logo_light.getpixel((x, y))
        if a > 30:
            # Check if this is the text (x >= 280) and dark green
            if x >= 270:
                if r < 100 and g < 150: # dark green text
                    # convert to crisp white preserving alpha
                    logo_light.putpixel((x, y), (255, 255, 255, a))
            else:
                # If it's the 'U' stroke (dark green, r < 50, g in 60..120, b < 60)
                # Keep it vibrant or lighten slightly for dark bg
                pass

test2 = Image.new('RGB', (850, 260), bg_dark)
test2.paste(logo_light, (30, 25), logo_light)
test2.save('scratch/footer_logo_white_text.png')
logo_light.save('public/logo_uk_light.png')
print('Both options generated')
