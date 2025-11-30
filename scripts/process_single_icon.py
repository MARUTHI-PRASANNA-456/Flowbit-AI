import os
from PIL import Image

def process_icon():
    source_image_path = "/Users/maruthiprasannareddy/.gemini/antigravity/brain/e7d3adff-5942-40c1-945c-8e9bc4ff8c39/uploaded_image_1764437730505.jpg"
    output_path = "/Users/maruthiprasannareddy/Documents/Flowbitai/public/nav-grid.png"
    
    if not os.path.exists(source_image_path):
        print(f"Error: Source image not found at {source_image_path}")
        return

    try:
        img = Image.open(source_image_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Change all white (also shades of whites) to transparent
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        
        img.putdata(newData)
        
        # Crop to content
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(output_path, "PNG")
        print(f"Saved processed icon to {output_path}")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    process_icon()
