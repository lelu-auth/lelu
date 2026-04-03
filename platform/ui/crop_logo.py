from PIL import Image
import sys
import os

def crop_image(input_path, output_path):
    print(f"Opening image: {input_path}")
    img = Image.open(input_path)
    
    if img.mode != 'RGBA':
        print(f"Converting to RGBA from {img.mode}")
        img = img.convert('RGBA')
    
    # Get the bounding box of non-zero alpha values
    bbox = img.getbbox()
    
    if bbox:
        print(f"Cropping to bbox: {bbox}")
        cropped_img = img.crop(bbox)
        # Create a new image with the same size as the crop but transparent
        # This ensures we have a clean alpha channel
        final_img = Image.new("RGBA", cropped_img.size, (0, 0, 0, 0))
        final_img.paste(cropped_img, (0, 0), cropped_img)
        
        final_img.save(output_path, "PNG")
        print(f"Success! Saved to {output_path}")
    else:
        print("Error: No transparent content found to crop. Just saving original.")
        img.save(output_path, "PNG")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python crop_logo.py <input> <output>")
    else:
        crop_image(sys.argv[1], sys.argv[2])
