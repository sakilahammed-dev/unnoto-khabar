from PIL import Image, ImageDraw, ImageFont, ImageFilter

base_banner = Image.open('public/hero_banner_unnoto_khabar.png').convert('RGBA')
bw, bh = base_banner.size # 1024 x 473

# Extract the exact man from the original banner (x=450..660, y=0..473)
man_crop = base_banner.crop((445, 0, 665, 473))

font_logo = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 38)
font_title = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 48)
font_sub = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 20)
font_badge = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 16)
font_offer = ImageFont.truetype('scratch/fonts/HindSiliguri-Bold.ttf', 18)

def draw_3d_text(draw, xy, text, font, fill_color, stroke_color=(255, 255, 255, 255), stroke_width=4):
    x, y = xy
    # Drop shadow
    draw.text((x + 2, y + 3), text, font=font, fill=(0, 0, 0, 70), stroke_width=stroke_width, stroke_fill=(0, 0, 0, 70))
    # White stroke / extrusion
    draw.text((x, y), text, font=font, fill=stroke_color, stroke_width=stroke_width, stroke_fill=stroke_color)
    # Main color fill
    draw.text((x, y), text, font=font, fill=fill_color)

# =========================================================================
# BANNER 2: সুন্দরবনের খাঁটি চাকের মধু (Honey Theme)
# =========================================================================
honey_banner = base_banner.copy()
# Clear right side (where phone was) with warm amber honey apiary glow
# Smartphone was x=640..870, y=50..470
for y in range(473):
    for x in range(635, 1024):
        # radial warm amber gradient
        dx = (x - 780) / 300
        dy = (y - 230) / 240
        dist = (dx*dx + dy*dy) ** 0.5
        t = min(1.0, dist)
        r = int(255 * (1 - t) + 245 * t)
        g = int(230 * (1 - t) + 190 * t)
        b = int(170 * (1 - t) + 100 * t)
        honey_banner.putpixel((x, y), (r, g, b, 255))

# Clear left text area
for y in range(85, 450):
    for x in range(30, 450):
        t = (x - 30) / (450 - 30)
        ty = (y - 85) / (450 - 85)
        r = int(255 * (1 - t) + 254 * t)
        g = int(253 * (1 - t) + 244 * t)
        b = int(250 * (1 - t) + 218 * t)
        honey_banner.putpixel((x, y), (r, g, b, 255))

# Paste the EXACT man to guarantee 100% face & body consistency
honey_banner.paste(man_crop, (445, 0))

# Load photorealistic honey jar crop from subagent generation
try:
    h_src = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/unnoto_khabar_honey_banner_1792490821020.jpg')
    # Jar is in h_src: x=480..650, y=360..670
    h_jar = h_src.crop((480, 360, 650, 670)).resize((210, 380), Image.Resampling.LANCZOS)
    # circular/feathered mask
    j_mask = Image.new('L', (210, 380), 0)
    ImageDraw.Draw(j_mask).ellipse([(10, 10), (200, 370)], fill=255)
    j_mask = j_mask.filter(ImageFilter.GaussianBlur(6))
    honey_banner.paste(h_jar, (720, 50), mask=j_mask)
except Exception as e:
    print('Honey jar load error:', e)

# Add rich Bengali typography for Honey Banner
d_h = ImageDraw.Draw(honey_banner)
draw_3d_text(d_h, (50, 110), "সুন্দরবনের", font=font_title, fill_color=(190, 100, 8, 255))
draw_3d_text(d_h, (50, 175), "প্রাকৃতিক খাঁটি মধু", font=font_title, fill_color=(10, 80, 25, 255))

# Subtitle
d_h.text((55, 255), "১০০% অপরিশোধিত ও প্রাকৃতিকভাবে চাক থেকে সংগৃহীত", font=font_sub, fill=(60, 64, 67, 255))

# Offer pill
pill_box = [(50, 305), (420, 355)]
d_h.rounded_rectangle(pill_box, radius=25, fill=(218, 41, 28, 255))
d_h.text((70, 318), "২৫% ছাড় + সারা দেশে ফ্রি ডেলিভারি!", font=font_offer, fill=(255, 255, 255, 255))

# Badges
badges_h = ["১০০% ল্যাব টেস্টেড", "ন্যাচারাল অ্যান্টিঅক্সিডেন্ট", "ক্যাশ অন ডেলিভারি"]
for idx, b_txt in enumerate(badges_h):
    bx = 50 + idx * 135
    d_h.rounded_rectangle([(bx, 380), (bx + 125, 420)], radius=12, fill=(255, 255, 255, 240), outline=(230, 200, 160, 255), width=1)
    d_h.text((bx + 10, 390), b_txt, font=font_badge, fill=(40, 44, 52, 255))

honey_banner.save('public/hero_banner_honey.png')
print('Honey banner saved to public/hero_banner_honey.png')

# =========================================================================
# BANNER 3: প্রিমিয়াম কোয়ালিটি হানি নাটস (Honey Nuts Theme)
# =========================================================================
nuts_banner = base_banner.copy()
for y in range(473):
    for x in range(635, 1024):
        dx = (x - 780) / 300
        dy = (y - 230) / 240
        dist = (dx*dx + dy*dy) ** 0.5
        t = min(1.0, dist)
        r = int(255 * (1 - t) + 250 * t)
        g = int(235 * (1 - t) + 210 * t)
        b = int(190 * (1 - t) + 140 * t)
        nuts_banner.putpixel((x, y), (r, g, b, 255))

for y in range(85, 450):
    for x in range(30, 450):
        t = (x - 30) / (450 - 30)
        r = int(255 * (1 - t) + 254 * t)
        g = int(253 * (1 - t) + 244 * t)
        b = int(250 * (1 - t) + 218 * t)
        nuts_banner.putpixel((x, y), (r, g, b, 255))

nuts_banner.paste(man_crop, (445, 0))

try:
    n_src = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/unnoto_khabar_honey_nuts_banner_1792490823517.jpg')
    n_jar = n_src.crop((510, 380, 680, 768)).resize((210, 380), Image.Resampling.LANCZOS)
    nj_mask = Image.new('L', (210, 380), 0)
    ImageDraw.Draw(nj_mask).ellipse([(10, 10), (200, 370)], fill=255)
    nj_mask = nj_mask.filter(ImageFilter.GaussianBlur(6))
    nuts_banner.paste(n_jar, (720, 50), mask=nj_mask)
except Exception as e:
    print('Honey nuts jar load error:', e)

d_n = ImageDraw.Draw(nuts_banner)
draw_3d_text(d_n, (50, 110), "প্রিমিয়াম কোয়ালিটি", font=font_title, fill_color=(170, 75, 10, 255))
draw_3d_text(d_n, (50, 175), "রয়েল হানি নাটস", font=font_title, fill_color=(10, 80, 25, 255))

d_n.text((55, 255), "সেরা বাদাম ও চাকের মধুর অনন্য মেলবন্ধন — অফুরন্ত শক্তি", font=font_sub, fill=(60, 64, 67, 255))

pill_box_n = [(50, 305), (420, 355)]
d_n.rounded_rectangle(pill_box_n, radius=25, fill=(244, 135, 33, 255))
d_n.text((70, 318), "২৫% ডিসকাউন্ট + সারা দেশে হোম ডেলিভারি ফ্রি!", font=font_offer, fill=(255, 255, 255, 255))

badges_n = ["রোস্টেড সেরা বাদাম", "প্রাকৃতিক এনার্জি বুস্টার", "১০০% পুষ্টিকর"]
for idx, b_txt in enumerate(badges_n):
    bx = 50 + idx * 135
    d_n.rounded_rectangle([(bx, 380), (bx + 125, 420)], radius=12, fill=(255, 255, 255, 240), outline=(230, 210, 180, 255), width=1)
    d_n.text((bx + 10, 390), b_txt, font=font_badge, fill=(40, 44, 52, 255))

nuts_banner.save('public/hero_banner_honey_nuts.png')
print('Honey nuts banner saved to public/hero_banner_honey_nuts.png')

# =========================================================================
# BANNER 4: মদিনার প্রিমিয়াম খেজুর (Dates Theme)
# =========================================================================
dates_banner = base_banner.copy()
for y in range(473):
    for x in range(635, 1024):
        dx = (x - 780) / 300
        dy = (y - 230) / 240
        dist = (dx*dx + dy*dy) ** 0.5
        t = min(1.0, dist)
        r = int(255 * (1 - t) + 245 * t)
        g = int(225 * (1 - t) + 195 * t)
        b = int(175 * (1 - t) + 130 * t)
        dates_banner.putpixel((x, y), (r, g, b, 255))

for y in range(85, 450):
    for x in range(30, 450):
        t = (x - 30) / (450 - 30)
        r = int(255 * (1 - t) + 254 * t)
        g = int(253 * (1 - t) + 244 * t)
        b = int(250 * (1 - t) + 218 * t)
        dates_banner.putpixel((x, y), (r, g, b, 255))

dates_banner.paste(man_crop, (445, 0))

try:
    d_src = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/unnoto_khabar_dates_banner_1792490827915.jpg')
    d_platter = d_src.crop((550, 620, 870, 768)).resize((260, 200), Image.Resampling.LANCZOS)
    dp_mask = Image.new('L', (260, 200), 0)
    ImageDraw.Draw(dp_mask).ellipse([(5, 5), (255, 195)], fill=255)
    dp_mask = dp_mask.filter(ImageFilter.GaussianBlur(6))
    dates_banner.paste(d_platter, (700, 180), mask=dp_mask)
except Exception as e:
    print('Dates platter load error:', e)

d_d = ImageDraw.Draw(dates_banner)
draw_3d_text(d_d, (50, 110), "মদিনার সেরা", font=font_title, fill_color=(150, 50, 10, 255))
draw_3d_text(d_d, (50, 175), "প্রিমিয়াম খেজুর", font=font_title, fill_color=(10, 80, 25, 255))

d_d.text((55, 255), "আসল আজওয়া ও মরিয়ম খেজুর — সুন্নতি আহার ও অফুরন্ত বরকত", font=font_sub, fill=(60, 64, 67, 255))

pill_box_d = [(50, 305), (420, 355)]
d_d.rounded_rectangle(pill_box_d, radius=25, fill=(10, 100, 45, 255))
d_d.text((70, 318), "সরাসরি মদিনা থেকে আমদানিকৃত ১০০% খাঁটি!", font=font_offer, fill=(255, 255, 255, 255))

badges_d = ["রাসায়নিক মুক্ত", "সতেজ ও সুস্বাদু", "ক্যাশ অন ডেলিভারি"]
for idx, b_txt in enumerate(badges_d):
    bx = 50 + idx * 135
    d_d.rounded_rectangle([(bx, 380), (bx + 125, 420)], radius=12, fill=(255, 255, 255, 240), outline=(210, 220, 200, 255), width=1)
    d_d.text((bx + 15, 390), b_txt, font=font_badge, fill=(40, 44, 52, 255))

dates_banner.save('public/hero_banner_dates.png')
print('Dates banner saved to public/hero_banner_dates.png')
print('All 3 carousel banners generated with 100% face consistency!')
