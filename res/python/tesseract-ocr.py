import cv2 
import pytesseract

# pytesseract.pytesseract.tesseract_cmd = """"""

def runOcr(img, language, configs):
    result = pytesseract.image_to_string(img,lang=language,config=configs)
    print(result)
