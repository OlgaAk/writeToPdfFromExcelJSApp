import sys
from pdf2image import convert_from_path
import os

IMAGE_RESOLUTION = 500  # high resolution
OUT_FOLDER_NAME = "out"
OUT_IMAGE_NAME = "out"


def main():
    if(len(sys.argv) > 1):
        dpfPath = sys.argv[1]
        createJpgFromPdf(dpfPath)


def createJpgFromPdf(dpfPath):
    dir = os.path.abspath(os.getcwd())
    # create folder for output files
    if not os.path.exists(OUT_FOLDER_NAME):
        os.makedirs(OUT_FOLDER_NAME)
    try:
        pages = convert_from_path(dpfPath, IMAGE_RESOLUTION)
        for i, page in enumerate(pages):
            if pageIsInvoice():  # skip horizintal pages because they are not invoices
                # saves only to the current folder?
                page.save(f"{OUT_IMAGE_NAME + str(i)}.jpg", "JPEG")
                # move to the output folder
                os.replace(dir + f"/{OUT_IMAGE_NAME + str(i)}.jpg", dir +
                           f"/{OUT_FOLDER_NAME}/{OUT_IMAGE_NAME + str(i)}.jpg")
        print("success")
    except Exception as e:
        print(e)


def pageIsInvoice(page):
    return page.height > page.width


if __name__ == "__main__":
    main()
