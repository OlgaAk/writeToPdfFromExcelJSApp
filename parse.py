from pdf2image import convert_from_path

pages = convert_from_path("report1.pdf", 500)
for page in pages:
    page.save("out.jpg", "JPEG")