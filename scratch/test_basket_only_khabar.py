from PIL import Image, ImageDraw, ImageFont

orig = Image.open('scratch/crops/orig_basket.png').convert('RGBA')

# In crop coords, 'কভার' is xc=78 to 118, yc=20 to 48.
# Dark panel background color:
for yc in range(18, 50):
    for xc in range(78, 120):
        # sample panel color from xc=77, yc
        orig.putpixel((xc, yc), (42, 44, 46, 255))

font = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
txt_layer = Image.new('RGBA', (60, 26), (0, 0, 0, 0))
dt = ImageDraw.Draw(txt_layer)
# White text with subtle drop shadow
dt.text((1, 2), "খাবার", font=font, fill=(0, 0, 0, 160))
dt.text((1, 1), "খাবার", font=font, fill=(255, 255, 255, 255))

# Rotate by -9.0 deg
txt_rot = txt_layer.rotate(-9.0, resample=Image.BICUBIC, expand=True)

# Overlay at xc=78, yc=22
orig.alpha_composite(txt_rot, (77, 21))
orig.save('scratch/crops/basket_khabar_perfect.png')
print('Basket khabar test saved')
