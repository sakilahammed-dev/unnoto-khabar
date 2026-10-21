from PIL import Image, ImageDraw, ImageFilter

# Load original full man
man = Image.open('scratch/crops/orig_full_man.png').convert('RGBA')
w, h = man.size

# In orig_full_man:
# Man width is 240, height is 423
# Head is y=0..180, x=50..180
# Thumbs up hand is x=70..115, y=160..240
# Body/Panjabi is y=150..423
# Let's test adding a black Mujib Coat:
# A Mujib coat is black sleeveless jacket over the torso.
# The sleeves (shoulders/arms: x=20..70, y=180..380 and right arm x=180..240) remain WHITE!
# The torso (x=70..180, y=170..420 except the hand at x=70..115, y=160..240) becomes BLACK!

mujib_man = man.copy()
# Let's inspect the RGB of the panjabi
# Panjabi is grayish white: r, g, b around 210..245
for y in range(160, h):
    for x in range(w):
        r, g, b, a = mujib_man.getpixel((x, y))
        # if it's the white panjabi on torso
        # Hand is skin tone: r > 180, g in 120..150, b in 90..130 (r-b > 50)
        is_skin = (r - b > 40) and (r > 160)
        # Basket is dark / vegetables
        if y > 240 and x > 110:
            continue # basket area
        if not is_skin and (r > 180 and g > 180 and b > 180 and abs(r-g) < 20):
            # If on the torso (x between 80 and 180)
            if 90 <= x <= 185 and y >= 165:
                # Turn white panjabi into black Mujib coat
                # Multiply by 0.15 for rich charcoal/black fabric texture
                mujib_man.putpixel((x, y), (int(r * 0.16), int(g * 0.16), int(b * 0.16), a))

mujib_man.save('scratch/crops/test_mujib_dress.png')
print('Mujib dress test saved')
