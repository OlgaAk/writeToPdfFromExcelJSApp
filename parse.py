import sys
from pdf2image import convert_from_path
import os

IMAGE_RESOLUTION = 500  # high resolution
OUT_FOLDER_NAME = "out"


def main():
    if(len(sys.argv) > 1):
        dpfPath = sys.argv[1]
        createJpgFromPdf(dpfPath)


def createJpgFromPdf(dpfPath):
    dir = os.path.abspath(os.getcwd())
    prepareFolder(dir)
    try:
        pages = convert_from_path(dpfPath, IMAGE_RESOLUTION)
        for i, page in enumerate(pages):
            if pageIsInvoice(page):  # skip horizintal pages because they are not invoices
                page.save(f"{str(i)}.jpg", "JPEG")
                os.replace(dir + f"/{str(i)}.jpg", dir +
                           f"/{OUT_FOLDER_NAME}/{str(i)}.jpg")  # move to the output folder
        print("success")
    except Exception as e:
        print(e)


def pageIsInvoice(page):
    return page.height > page.width


def cleanFolder(dir):
    for file in os.listdir(dir):
        os.remove(dir + f"/{file}")


def prepareFolder(dir):
    if not os.path.exists(OUT_FOLDER_NAME):
        os.makedirs(OUT_FOLDER_NAME)
    else:
        cleanFolder(dir + f"/{OUT_FOLDER_NAME}")


if __name__ == "__main__":
    main()
