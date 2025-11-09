# Earth Image Setup Instructions

## How to Add the Earth Image

1. **Save the Earth image** you provided as `earth.jpg` in this directory (`frontend/public/images/`)

2. **Image Requirements:**
   - File name: `earth.jpg`
   - Format: JPG or PNG
   - Recommended size: 1920x1080 or higher for best quality
   - The image should show Earth from space with the blue atmosphere and starfield

3. **Current Setup:**
   - The CSS is already configured to use `/images/earth.jpg`
   - The image will be used as the background for the hero section only
   - A subtle dark overlay is applied for text readability
   - The background is set to `background-attachment: fixed` for a parallax effect

4. **Alternative Method:**
   If you prefer to use a different filename, update the CSS in:
   `frontend/src/components/LandingPage.css` 
   
   Look for:
   ```css
   background: url('/images/earth.jpg');
   ```
   
   And change the filename to match your image.

## Current Status
- ✅ CSS configured for Earth image background
- ✅ Overlay and text styling optimized
- ⏳ Waiting for actual Earth image file

Once you add the image file, the landing page will display the beautiful Earth background!