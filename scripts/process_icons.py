import os
from PIL import Image

def slice_icons():
    # Path to the uploaded image
    source_image_path = "/Users/maruthiprasannareddy/.gemini/antigravity/brain/613265ea-ed1d-47ca-b577-7b83b6c019c6/uploaded_image_1764435322631.png"
    output_dir = "/Users/maruthiprasannareddy/Documents/Flowbitai/public"
    
    if not os.path.exists(source_image_path):
        print(f"Error: Source image not found at {source_image_path}")
        return

    try:
        img = Image.open(source_image_path)
        width, height = img.size
        
        # Calculate dimensions for 2x2 grid
        w_half = width // 2
        h_half = height // 2
        
        # Define crop boxes (left, upper, right, lower)
        # Top-Left: Home
        home_box = (0, 0, w_half, h_half)
        # Top-Right: Grid
        grid_box = (w_half, 0, width, h_half)
        # Bottom-Left: User
        user_box = (0, h_half, w_half, height)
        # Bottom-Right: Settings
        settings_box = (w_half, h_half, width, height)
        
        icons = [
            ("nav-home.png", home_box),
            ("nav-grid.png", grid_box),
            ("nav-user.png", user_box),
            ("nav-settings.png", settings_box)
        ]
        
        for name, box in icons:
            icon = img.crop(box)
            # Optional: Trim whitespace if needed, but simple crop is safer for alignment if grid is perfect
            # Let's just save for now
            icon.save(os.path.join(output_dir, name))
            print(f"Saved {name}")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    slice_icons()
