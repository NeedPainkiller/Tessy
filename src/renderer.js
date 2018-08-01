// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const shell = require('child_process');
const Rx = require('./rx')


function runPortManShell(command) {
    return Rx.Observable
        .fromPromise(new Promise((resolve, reject) => {
            // shell.spawn('res/portmanshell.exe', command) // in dev environment
            shell.spawn('resources/app/res/portmanshell.exe', command)
                .stdout.on('data', (data) => resolve(data.toString()))
        }))
        .map(stdout => stdout.split('\\n').splice(5))
        .flatMap(stdout => stdout.splice(0, stdout.length - 2))
        .map(data => data.replace(/[\s]{3,}/gi, ","))
        .map(data => data.replace(/\\r/gi, ""))
        .map(data => data.split(','))
}

function showSnackBar(message, time = 3000) {
    let snackbar = document.getElementById("snackbar");
    let messageSpan = document.getElementById("snack-message");
    messageSpan.innerText = message;
    snackbar.classList.add("active");
    setTimeout(() => snackbar.classList.remove("active"), time)
}

function openLink(link){
    require('electron').shell.openExternal(link)
}

document.getElementById("add-btn").onclick = () => showSnackBar("test");
document.getElementById("tesseract-btn").onclick = () => openLink("https://github.com/tesseract-ocr/tesseract/wiki/Downloads");
document.getElementById("pytesseract-btn").onclick = () => openLink("https://github.com/madmaze/pytesseract");
document.getElementById("language-btn").onclick = () => openLink("https://github.com/tesseract-ocr/tessdata");
document.getElementById("command-btn").onclick = () => openLink("https://github.com/tesseract-ocr/tesseract/wiki/Command-Line-Usage");


document.getElementById("image-upload").addEventListener("change",
    (e) => {
        let file = e.currentTarget.files[0];
        let imageType = /image.*/;
        if (!file.type.match(imageType)) {
            throw 'Datei ist kein Bild';
        } else if (!file) {
            throw 'Kein Bild gewählt';
        } else {
            previewImage(file);
        }
    });

function previewImage(file) {
    let thumb = document.getElementById("js--image-preview"),
        reader = new FileReader();

    reader.onload = function () {
        thumb.style.backgroundImage = 'url(' + reader.result + ')';
        document.getElementsByClassName('fa-image')[0].style.opacity = "0";
    }
    reader.readAsDataURL(file);
    thumb.className += ' js--no-default';
}
