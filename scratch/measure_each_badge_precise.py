from PIL import Image

im = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792537058370_87cc55c7.png').convert('RGB')

# Let's inspect each badge by searching outwards from its approximate center:
approx_centers = [
    ("honey", 284, 98),
    ("honey-nuts", 510, 98),
    ("whole-nuts", 724, 98),
    ("dates", 308, 284),
    ("oil-ghee", 510, 284),
    ("shutki-balachaw", 717, 284),
    ("health-mix", 316, 474),
    ("super-seeds", 512, 474),
    ("pickles-spices", 712, 474)
]

for name, acx, acy in approx_centers:
    # Scan horizontally left and right from acy
    # find where pixel becomes white (r>242, g>242, b>242)
    left_x = acx
    while left_x > 0:
        r, g, b = im.getpixel((left_x, acy))
        if r > 242 and g > 242 and b > 242:
            break
        left_x -= 1
    
    right_x = acx
    while right_x < im.width - 1:
        r, g, b = im.getpixel((right_x, acy))
        if r > 242 and g > 242 and b > 242:
            break
        right_x += 1
        
    # Scan vertically up and down from acx
    top_y = acy
    while top_y > 0:
        r, g, b = im.getpixel((acx, top_y))
        if r > 242 and g > 242 and b > 242:
            break
        top_y -= 1
        
    bottom_y = acy
    while bottom_y < im.height - 1:
        r, g, b = im.getpixel((acx, bottom_y))
        if r > 242 and g > 242 and b > 242:
            break
        bottom_y += 1
        
    cx = (left_x + 1 + right_x - 1) / 2.0
    cy = (top_y + 1 + bottom_y - 1) / 2.0
    rx = (right_x - left_x - 1) / 2.0
    ry = (bottom_y - top_y - 1) / 2.0
    print(f"{name:15s}: x=[{left_x+1}, {right_x-1}] (rx={rx:.1f}), y=[{top_y+1}, {bottom_y-1}] (ry={ry:.1f}) -> center=({cx:.1f}, {cy:.1f})")

