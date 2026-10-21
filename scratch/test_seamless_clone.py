import cv2
import numpy as np

# Source: original face
src_full = cv2.imread('public/hero_banner_unnoto_khabar.png')
# Original face in banner: x=480..600, y=55..230
face_roi = src_full[55:230, 480:600]

# Target: honey banner
dst = cv2.imread('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/unnoto_khabar_honey_banner_1792490821020.jpg')

# In dst, target head is around center (975, 175)
# Face roi size is (175, 120). Target head is larger (approx 270x190)
scale = 1.55
resized_face = cv2.resize(face_roi, (int(face_roi.shape[1] * scale), int(face_roi.shape[0] * scale)), interpolation=cv2.INTER_LANCZOS4)

# Create an elliptical mask for seamlessClone
h, w = resized_face.shape[:2]
mask = np.zeros((h, w), dtype=np.uint8)
cv2.ellipse(mask, (w // 2, h // 2), (w // 2 - 10, h // 2 - 10), 0, 0, 360, 255, -1)

# Center of insertion on target
center = (980, 180)

# Seamless clone
cloned = cv2.seamlessClone(resized_face, dst, mask, center, cv2.NORMAL_CLONE)

# Save result
cv2.imwrite('scratch/crops/seamless_clone_honey.jpg', cloned)
# Crop around head to inspect
crop = cloned[30:350, 850:1120]
cv2.imwrite('scratch/crops/seamless_clone_head_crop.jpg', crop)
print('Seamless clone completed!')
