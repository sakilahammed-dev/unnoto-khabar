from PIL import Image

im = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792537058370_87cc55c7.png').convert('RGBA')
w, h = im.size

print('Inspecting y=100 across columns:')
row_pixels = [im.getpixel((x, 100)) for x in range(0, w, 20)]
for i, p in enumerate(row_pixels):
    x = i * 20
    is_white = p[0] > 240 and p[1] > 240 and p[2] > 240
    if not is_white:
        print(f'x={x}: {p}')

