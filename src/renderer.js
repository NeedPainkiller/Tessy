// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {execFile} = require('child_process')
const fs = require('fs')
const Rx = require('./rx')
let ocrfile


function showSnackBar(message, time = 3000) {
    let snackbar = document.getElementById("snackbar")
    let messageSpan = document.getElementById("snack-message")
    messageSpan.innerText = message
    snackbar.classList.add("active")
    setTimeout(() => snackbar.classList.remove("active"), time)
}

function loaderFadeIn() {
    document.getElementById("loader").style.opacity = 1
    document.getElementsByTagName("body")[0].style.pointerEvents = "none"
    document.getElementById("main").style.opacity = 0.5
}

function loaderFadeOut() {
    document.getElementById("loader").style.opacity = 0
    document.getElementsByTagName("body")[0].style.pointerEvents = "auto"
    document.getElementById("main").style.opacity = 1
}


function openLink(link) {
    require('electron').shell.openExternal(link)
}

document.getElementById("image-upload").addEventListener("change",
    (e) => {
        let file = e.currentTarget.files[0]
        let imageType = /image.*/
        if (!file.type.match(imageType) || !file) {
        } else {
            previewImage(file)
        }
    })

function previewImage(file) {
    let thumb = document.getElementById("js--image-preview"),
        reader = new FileReader()

    // fs.createReadStream(file.path).pipe(fs.createWriteStream('res/temp/ocr.png'));
    loaderFadeIn()
    reader.onload = function () {
        thumb.style.backgroundImage = 'url(' + reader.result + ')'
        document.getElementsByClassName('fa-image')[0].style.opacity = "0"
        loaderFadeOut()
    }
    reader.readAsDataURL(file)
    thumb.className += ' js--no-default'
    ocrfile = file
}

function runOcr() {
    if (!ocrfile) {
        showSnackBar("PLZ SELECT Image")
        return
    }

    let tessPath = document.getElementById("tesseract-path").value || "C:\\Program Files\n(x86)\\Tesseract-OCR\\tesseract"
    // let tessPath = document.getElementById("tesseract-path").value || "C:\\DEV\\MODULE\\Tesseract-OCR\\tesseract"
    // let tessPath = document.getElementById("tesseract-path").value || "C:\\DEV\\MODULES\\Tesseract-OCR\\tesseract"
    let language = document.getElementById("tesseract-language").value || "eng"
    let psm = document.getElementById("psm").value
    let oem = document.getElementById("oem").value
    let colored = document.getElementById("colored").value
    loaderFadeIn()
    console.log([tessPath, language, psm, oem, colored, ocrfile.path])
    return Rx.Observable.fromPromise(new Promise((resolve, reject) => {
            execFile("res/python/tesseract-ocr.exe", [tessPath, language, psm, oem, colored, ocrfile.path], (error, stdout, stderr) => {
            // execFile("resources/app/res/python/tesseract-ocr.exe", [tessPath, language, psm, oem, colored, ocrfile.path], (error, stdout, stderr) => {
                if (error || stderr) reject(error)
                else resolve(stdout.toString())
            })
        })
    )
}


function show(message) {
    document.getElementById("console").innerText = "> " + message
}

document.getElementById("add-btn").onclick = () => {
    showSnackBar("running...")
    runOcr().subscribe((data) => show(data),
        (err) => {
            show("Error: " + err)
            showSnackBar("Error!!")
            loaderFadeOut()
        },
        () => {
            loaderFadeOut()
            showSnackBar("DONE!")
        })
}
document.getElementById("tesseract-btn").onclick = () => openLink("https://github.com/tesseract-ocr/tesseract/wiki/Downloads")
document.getElementById("pytesseract-btn").onclick = () => openLink("https://github.com/madmaze/pytesseract")
document.getElementById("language-btn").onclick = () => openLink("https://github.com/tesseract-ocr/tessdata")
document.getElementById("command-btn").onclick = () => openLink("https://github.com/tesseract-ocr/tesseract/wiki/Command-Line-Usage")
