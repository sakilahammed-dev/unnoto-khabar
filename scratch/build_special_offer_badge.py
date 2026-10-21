from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

# Load honey and honey-nuts badges
honey_badge = Image.open('public/categories/emblems/honey.png').convert('RGBA')
nuts_badge = Image.open('public/categories/emblems/honey-nuts.png').convert('RGBA')
w, h = 240, 240
cx, cy = w / 2.0, h / 2.0

# 1. Base ring & background
# We create a composite background
base = Image.new('RGBA', (w, h), (0, 0, 0, 0))
# Copy outer ring from honey_badge (radius > 86)
bdraw = ImageDraw.Draw(base)

# Create cream starlight background inside r=86
for r in range(86, -1, -1):
    f = r / 86.0
    cr = int(255 * (1 - f) + 222 * f)
    cg = int(253 * (1 - f) + 232 * f)
    cb = int(242 * (1 - f) + 200 * f)
    bdraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(cr, cg, cb, 255))

# Outer gold rings from honey_badge:
# paste honey_badge outside radius 86
outer_mask = Image.new('L', (w, h), 0)
omdraw = ImageDraw.Draw(outer_mask)
omdraw.ellipse([cx - 86, cy - 86, cx + 86, cy + 86], fill=255)
# Invert mask so outer ring is kept
inv_mask = Image.eval(outer_mask, lambda a: 255 - a)
base.paste(honey_badge, (0, 0), inv_mask)

# Inner border lines
bdraw.ellipse([cx - 86, cy - 86, cx + 86, cy + 86], outline=(16, 69, 0, 255), width=2)
bdraw.ellipse([cx - 84, cy - 84, cx + 84, cy + 84], outline=(205, 172, 85, 255), width=1)

# Sparkles
for sx, sy in [(cx-45, cy-25), (cx+50, cy-20), (cx-50, cy+25), (cx+48, cy+20), (cx-20, cy-48), (cx+25, cy-45)]:
    bdraw.ellipse([sx-1.5, sy-1.5, sx+1.5, sy+1.5], fill=(255, 255, 255, 240))
    bdraw.line([sx-4, sy, sx+4, sy], fill=(255, 235, 170, 180), width=1)
    bdraw.line([sx, sy-4, sx, sy+4], fill=(255, 235, 170, 180), width=1)

# Center illustration: Combo of Honey Jar (left) and Honey Nuts Bowl (right) + 25% OFF Badge
# Extract honey jar from honey_badge
# Center of illustration in honey_badge is roughly cx=120, cy=130
honey_crop = honey_badge.crop((55, 75, 150, 175)).resize((75, 80), Image.Resampling.LANCZOS)
# Extract nuts bowl from nuts_badge
nuts_crop = nuts_badge.crop((85, 95, 175, 175)).resize((72, 65), Image.Resampling.LANCZOS)

# Paste combo
base.paste(honey_crop, (int(cx - 68), int(cy - 40)), honey_crop)
base.paste(nuts_crop, (int(cx - 5), int(cy - 25)), nuts_crop)

# Draw a glowing discount tag / star badge in center-bottom
tag_w, tag_h = 70, 22
tag_x, tag_y = int(cx - tag_w / 2), int(cy + 24)
tdraw = ImageDraw.Draw(base)
tdraw.rounded_rectangle([tag_x, tag_y, tag_x + tag_w, tag_y + tag_h], radius=11, fill=(220, 38, 38, 245), outline=(255, 215, 0, 255), width=1)

# Text on tag: "২৫% ছাড়"
font_tag = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
tdraw.text((cx, tag_y + tag_h / 2), "২৫% ছাড়", fill=(255, 255, 255, 255), font=font_tag, anchor="mm")

# Arched Text function
def draw_arched_text(img, text, font, radius, center_angle, direction='top', color=(180, 0, 0, 255)):
    # Render characters along a circle arc
    cx, cy = img.width / 2.0, img.height / 2.0
    chars = list(text)
    # estimate angular span per char
    char_widths = [font.getlength(c) for c in chars]
    total_w = sum(char_widths)
    # angle per pixel: 360 / (2 * pi * radius)
    deg_per_px = 360.0 / (2 * math.pi * radius)
    total_angle = total_w * deg_per_px
    
    current_angle = center_angle - total_angle / 2.0 if direction == 'top' else center_angle + total_angle / 2.0
    
    for i, c in enumerate(chars):
        cw = char_widths[i]
        c_angle = current_angle + (cw / 2.0) * deg_per_px if direction == 'top' else current_angle - (cw / 2.0) * deg_per_px
        
        # Position on circle
        rad = math.radians(c_angle)
        x = cx + radius * math.sin(rad)
        y = cy - radius * math.cos(rad) if direction == 'top' else cy + radius * math.cos(rad)
        
        # Render single character to a small transparent image and rotate
        char_img = Image.new('RGBA', (int(cw * 2 + 30), int(font.size * 2 + 30)), (0, 0, 0, 0))
        cdraw = ImageDraw.Draw(char_img)
        cdraw.text((char_img.width / 2, char_img.height / 2), c, font=font, fill=color, anchor='mm')
        
        rot_deg = -c_angle if direction == 'top' else c_angle
        rotated = char_img.rotate(rot_deg, resample=Image.Resampling.BICUBIC)
        
        img.paste(rotated, (int(x - rotated.width / 2), int(y - rotated.height / 2)), rotated)
        
        if direction == 'top':
            current_angle += cw * deg_per_px
        else:
            current_angle -= cw * deg_per_px

# Draw top arched text: "বিশেষ অফার"
font_top = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 24)
draw_arched_text(base, "বিশেষ অফার", font_top, radius=72, center_angle=0, direction='top', color=(185, 20, 20, 255))

# Draw bottom arched text: "SPECIAL OFFERS"
font_bottom = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 13)
draw_arched_text(base, "SPECIAL OFFERS", font_bottom, radius=72, center_angle=0, direction='bottom', color=(16, 85, 32, 255))

# Save
base.save('public/categories/emblems/special-offers.png')
base.save('scratch/special_offers_emblem_py.png')
print('Special offer emblem generated successfully!')
