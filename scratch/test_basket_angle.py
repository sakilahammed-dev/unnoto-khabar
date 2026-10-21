from PIL import Image, ImageDraw, ImageFont
import math

orig = Image.open('scratch/crops/orig_basket.png').convert('RGBA')

# Let's clone
test_img = orig.copy()
# The panel background is dark charcoal/black
# Let's see pixels at x=20..110, y=20..50
# Sample background color from around the text:
bg_color = (42, 44, 46, 255)

# In crop coordinates, text is x=22 to 105, y=20 to 46.
# If we fill this region with bg_color:
d = ImageDraw.Draw(test_img)
# Draw polygon covering the text area
# Top edge: (22, 22) to (105, 34)
# Bottom edge: (105, 48) to (22, 38)
d.polygon([(22, 22), (105, 34), (105, 48), (22, 38)], fill=bg_color)

# Now render "উন্নত খাবার"
font = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
txt_layer = Image.new('RGBA', (110, 30), (0, 0, 0, 0))
dt = ImageDraw.Draw(txt_layer)
dt.text((2, 2), "উন্নত খাবার", font=font, fill=(255, 255, 255, 240))

# Rotate by -9.0 degrees (tilt downwards to right)
# Note PIL rotate with negative angle rotates clockwise!
txt_rot = txt_layer.rotate(-9.2, resample=Image.BICUBIC, expand=True)

test_img.alpha_composite(txt_rot, (22, 22))
test_img.save('scratch/crops/test_basket_aligned.png')
print('Basket aligned saved')
