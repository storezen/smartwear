from PIL import Image

def make_transparent():
    img = Image.open("/Users/mrmacbook/Desktop/ecomrenceapp/public/hero-watch.png").convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    # Tolerance for "black"
    tolerance = 15
    for item in datas:
        # If the pixel is very dark (close to black), make it transparent
        if item[0] < tolerance and item[1] < tolerance and item[2] < tolerance:
            # You can also feather this by setting alpha based on brightness
            # But simple threshold is:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save("/Users/mrmacbook/Desktop/ecomrenceapp/public/hero-watch-transparent.png", "PNG")

make_transparent()
