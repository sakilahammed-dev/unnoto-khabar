from PIL import Image
import math

raw_img = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792537058370_87cc55c7.png').convert('RGB')

# Let's inspect "dates" at center (308.5, 287.0)
cx, cy = 308.5, 287.0
for r in range(85, 98):
    # check color at angle 0 (right: x=cx+r, y=cy)
    px = int(round(cx + r))
    py = int(round(cy))
    print(f"r={r:2d}, pixel at ({px}, {py}) = {raw_img.getpixel((px, py))}")

