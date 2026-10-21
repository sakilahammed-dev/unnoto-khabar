from PIL import Image

im = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792536539923_fc3374a1.png')

# Let's crop row 0 col 0, row 0 col 1, row 0 col 2
im.crop((160, 0, 380, 200)).save('scratch/badge_0_0.png')
im.crop((380, 0, 640, 200)).save('scratch/badge_0_1.png')
im.crop((640, 0, 860, 200)).save('scratch/badge_0_2.png')

print('Test crops saved')
