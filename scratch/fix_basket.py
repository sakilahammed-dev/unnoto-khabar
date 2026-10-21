from PIL import Image, ImageDraw, ImageFont

img = Image.open('public/hero_banner_unnoto_khabar.png').convert('RGBA')
orig = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792487959384_dda70957.png').convert('RGBA')

# First restore the basket from original image
basket_box = (510, 390, 640, 460)
img.paste(orig.crop(basket_box), basket_box)

# Now inpaint ONLY 'কভার' on the basket:
# 'কভার' is strictly: x=590 to 623, y=417 to 441
for y in range(417, 442):
    # interpolate between plate color at left and plate color at right
    c_l = img.getpixel((588, y))
    c_r = img.getpixel((624, y))
    for x in range(589, 624):
        t = (x - 589) / (624 - 589)
        r = int(c_l[0] * (1 - t) + c_r[0] * t)
        g = int(c_l[1] * (1 - t) + c_r[1] * t)
        b = int(c_l[2] * (1 - t) + c_r[2] * t)
        img.putpixel((x, y), (r, g, b, 255))

font_basket = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
b_layer = Image.new('RGBA', (60, 26), (0, 0, 0, 0))
db = ImageDraw.Draw(b_layer)
db.text((1, 2), "খাবার", font=font_basket, fill=(0, 0, 0, 160))
db.text((1, 1), "খাবার", font=font_basket, fill=(255, 255, 255, 255))
b_rot = b_layer.rotate(-9.0, resample=Image.BICUBIC, expand=True)
img.alpha_composite(b_rot, (588, 412))

img.save('public/hero_banner_unnoto_khabar.png')
img.crop(basket_box).save('scratch/crops/final_basket.png')
print('Basket flawlessly fixed!')
