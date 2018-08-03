import sys
from PIL import Image
import pytesseract


def run():
    pytesseract.pytesseract.tesseract_cmd=str(sys.argv[1])
    language= str(sys.argv[2])
    psm= str(sys.argv[3])
    oem= str(sys.argv[4])
    grayScale=int(sys.argv[5])
    imgPath=str(sys.argv[6])
    img = Image.open(imgPath)

    if grayScale == 0:
        img = img.convert('LA')

    configs = "--psm " + psm + " --oem " + oem

    result = pytesseract.image_to_string(img,lang=language,config=configs)
    print(result)

run()
#python .\tesseract-ocr.py "C:\DEV\MODULE\Tesseract-OCR\tesseract" eng 3 3 1 "../temp/ocr.png"
#python .\tesseract-ocr.py "C:\\DEV\\MODULE\\Tesseract-OCR\\tesseract" eng 8 3 0 "..\\temp\\ocr.png"