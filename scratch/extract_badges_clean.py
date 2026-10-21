from PIL import Image, ImageDraw, ImageFilter
import os

raw_img = Image.open('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/.user_uploaded/media_1792537058370_87cc55c7.png').convert('RGBA')

# Let's inspect the approximate centers:
# Row 0: y ~ 95
# Row 1: y ~ 285
# Row 2: y ~ 475
# Col 0: x ~ 290
# Col 1: x ~ 512
# Col 2: x ~ 730
# Diameter is approximately 190 px, radius ~ 95 px

# Let's refine the exact center for each badge by testing circle masks
centers = [
    ("honey", 282, 95),
    ("honey-nuts", 512, 95),
    ("whole-nuts", 730, 95),
    ("dates", 298, 285),
    ("oil-ghee", 512, 285),
    ("shutki-balachaw", 726, 285),
    ("health-mix", 306, 475),
    ("super-seeds", 512, 475),
    ("pickles-spices", 725, 475)
]

os.makedirs('scratch/extracted_badges', exist_ok=True)
os.makedirs('public/categories/emblems', exist_ok=True)

for name, approx_cx, approx_cy in centers:
    # Search around approx_cx, approx_cy for the exact center that maximizes symmetry of the gold/green outer border
    best_cx, best_cy, best_r = approx_cx, approx_cy, 94
    best_score = -1
    
    # We know the outer circle radius is between 91 and 97
    # Along the circle perimeter, the pixel should have the outer gold ring color (r>140, g>110, b<110)
    for cx in range(approx_cx - 8, approx_cx + 9):
        for cy in range(approx_cy - 8, approx_cy + 9):
            for r in [92, 93, 94, 95, 96]:
                # Sample 36 points around perimeter
                import math
                score = 0
                for angle_deg in range(0, 360, 10):
                    theta = math.radians(angle_deg)
                    px = int(round(cx + r * math.cos(theta)))
                    py = int(round(cy + r * math.sin(theta)))
                    if 0 <= px < raw_img.width and 0 <= py < raw_img.height:
                        red, green, blue, _ = raw_img.getpixel((px, py))
                        # gold ring: reddish-gold (red > 130, green > 100, blue < 120, not white)
                        if (red > 130 and green > 100 and blue < 130) or (green > red and green > 70 and blue < 70):
                            score += 1
                if score > best_score:
                    best_score = score
                    best_cx = cx
                    best_cy = cy
                    best_r = r
    
    print(f"{name}: refined center=({best_cx}, {best_cy}), radius={best_r}, score={best_score}/36")
    
    # Extract with anti-aliased circular mask
    # Crop a bounding box with 4px margin around radius
    crop_size = (best_r + 4) * 2
    crop_x1 = best_cx - best_r - 4
    crop_y1 = best_cy - best_r - 4
    
    patch = raw_img.crop((crop_x1, crop_y1, crop_x1 + crop_size, crop_y1 + crop_size))
    
    # High-resolution circular mask with 4x supersampling for ultra smooth anti-aliased edge
    scale = 4
    mask_large = Image.new('L', (crop_size * scale, crop_size * scale), 0)
    mdraw = ImageDraw.Draw(mask_large)
    center_scaled = (best_r + 4) * scale
    r_scaled = best_r * scale
    mdraw.ellipse([center_scaled - r_scaled, center_scaled - r_scaled, center_scaled + r_scaled, center_scaled + r_scaled], fill=255)
    mask = mask_large.resize((crop_size, crop_size), Image.Resampling.LANCZOS)
    
    # Apply mask
    badge_out = Image.new('RGBA', (crop_size, crop_size), (0, 0, 0, 0))
    badge_out.paste(patch, (0, 0), mask)
    
    # Resize to standard uniform 200x200 master size
    badge_final = badge_out.resize((200, 200), Image.Resampling.LANCZOS)
    
    badge_final.save(f'public/categories/emblems/{name}.png')
    badge_final.save(f'scratch/extracted_badges/{name}.png')

print("All 9 extracted successfully!")
