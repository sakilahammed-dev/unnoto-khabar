from PIL import Image, ImageDraw, ImageFont

orig = Image.open('scratch/crops/orig_basket.png').convert('RGBA')

# In crop coords, 'কভার' is xc=78 to 110, yc=23 to 45.
# Let's interpolate seamlessly
for yc in range(23, 46):
    c_l = orig.getpixel((77, yc))
    c_r = orig.getpixel((111, yc))
    for xc in range(78, 111):
        t = (xc - 78) / (111 - 78)
        r = int(c_l[0] * (1 - t) + c_r[0] * t)
        g = int(c_l[1] * (1 - t) + c_r[1] * t)
        b = int(c_l[2] * (1 - t) + c_r[2] * t)
        orig.putpixel((xc, yc), (r, g, b, 255))

font = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
txt_layer = Image.new('RGBA', (60, 26), (0, 0, 0, 0))
dt = ImageDraw.Draw(txt_layer)
# White text with subtle shadow
dt.text((1, 2), "খাবার", font=font, fill=(0, 0, 0, 160))
dt.text((1, 1), "খাবার", font=font, fill=(255, 255, 255, 255))

# Rotate by -9.0 deg
txt_rot = txt_layer.rotate(-9.0, resample=Image.BICUBIC, expand=True)

# Overlay at xc=77, yc=21
orig.alpha_composite(txt_rot, (77, 21))
orig.save('scratch/crops/basket_seamless.png')
print('Basket seamless saved')
