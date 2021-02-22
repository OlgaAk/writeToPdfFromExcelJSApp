from pdf2image import convert_from_path

IMAGE_RESOLUTION = 500  # high resolution

# Converts pdf file to a jpeg image
pages = convert_from_path("report1.pdf", IMAGE_RESOLUTION)
for i, page in enumerate(pages):
    page.save(f"out{i}.jpg", "JPEG")
