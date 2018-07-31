// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const shell = require('child_process');
const Rx = require('./rx')

function refresh() {
    cleanForwardList();
    showSnackBar("Wait a Second ...", 1500);
    runPortManShell(['SHOW']).subscribe(
        (data) => addForwardList(data),
        (err) => console.log('Error: %s', err),
        () => showForwardList());
}

function addForward() {
    let ip = getIP();
    let port = getPort();
    if (!ip || !port) {
        return
    }
    let command = ["ADD", port.listenPort, ip.listenAddress, port.connectPort, ip.connectAddress];
    cleanForwardList();
    showSnackBar(ip.listenAddress + " : " + port.listenPort + " > " + ip.connectAddress + " : " + port.connectPort);
    runPortManShell(command)
        .subscribe((data) => addForwardList(data),
            (err) => console.log('Error: %s', err),
            () => showForwardList())
}

function getIP() {
    const ipAddrRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    let listenAddress = document.getElementById("listen-address").value;
    let connectAddress = document.getElementById("connect-address").value;
    if (listenAddress === "") listenAddress = "0.0.0.0";
    if (connectAddress === "") connectAddress = "127.0.0.1";

    if (!listenAddress.match(ipAddrRegex)) {
        showSnackBar("Check the Listen IP Address");
        return
    }
    if (!connectAddress.match(ipAddrRegex)) {
        showSnackBar("Check the Connect IP Address");
        return
    }
    return {listenAddress, connectAddress}
}

function getPort() {
    let listenPort = document.getElementById("listen-port").value;
    let connectPort = document.getElementById("connect-port").value;
    if (listenPort === "" || connectPort === "") {
        showSnackBar("We Need To IP & Port");
        return
    }
    if (listenPort < 0 || listenPort > 65535 || listenPort === "") {
        showSnackBar("Check the Listen Port");
        return
    }
    if (connectPort < 0 || connectPort > 65535 || connectPort === "") {
        showSnackBar("Check the Connect Port");
        return
    }
    return {listenPort, connectPort}
}

function delForward(address, port) {
    let command = ["DELETE", port, address];
    cleanForwardList();
    showSnackBar(address + " : " + port + " >  REMOVE");
    runPortManShell(command).subscribe(
        (data) => addForwardList(data),
        (err) => console.log('Error: %s', err),
        () => showForwardList())
}

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

function addForwardList(data) {
    let ul = document.getElementById("list");
    let li = document.createElement("li");
    li.setAttribute("class", "item");

    let iconExchange = document.createElement("i");
    iconExchange.setAttribute("class", "fas fa-exchange-alt");
    li.appendChild(iconExchange);

    let iconTrash = document.createElement("i");
    iconTrash.setAttribute("class", "fas fa-trash-alt");
    li.appendChild(iconTrash);

    let div = document.createElement("div");

    let labelListen = document.createElement("span");
    labelListen.setAttribute("class", "listen-label");
    labelListen.innerText = data[0] + " : " + data[1];
    div.appendChild(labelListen);

    div.appendChild(document.createElement("br"));

    let labelConnect = document.createElement("span");
    labelConnect.setAttribute("class", "listen-connect");
    labelConnect.innerText = data[2] + " : " + data[3];
    div.appendChild(labelConnect);

    div.appendChild(document.createElement("br"));
    li.appendChild(div);
    ul.appendChild(li)
}

function showForwardList() {
    loaderFadeOut();
    let ul = document.getElementById("list");
    ul.classList.remove("active");
    let items = Array.from(ul.querySelectorAll("li"));
    items.forEach((li, index) => setTimeout(() => li.style.opacity = 1, (index * 200) + 10)
    )
}

function cleanForwardList() {
    loaderFadeIn();
    let ul = document.getElementById("list");
    ul.classList.add("active");
    let items = Array.from(ul.querySelectorAll("li"));
    items.forEach((li) => li.style.opacity = 0);
    setTimeout(() => ul.innerHTML = "", 300)

}

function loaderFadeIn() {
    document.getElementById("loader").style.opacity = 1;
    document.getElementById("none").style.opacity = 0;
    document.getElementsByTagName("body")[0].style.pointerEvents = "none"
}

function loaderFadeOut() {
    document.getElementById("loader").style.opacity = 0;
    document.getElementsByTagName("body")[0].style.pointerEvents = "auto";

    if (document.getElementById("list").getElementsByTagName("li").length === 0) {
        document.getElementById("none").style.opacity = 1
    }
}

function showSnackBar(message, time = 3000) {
    let snackbar = document.getElementById("snackbar");
    let messageSpan = document.getElementById("snack-message");
    messageSpan.innerText = message;
    snackbar.classList.add("active");
    setTimeout(() => snackbar.classList.remove("active"), time)
}


document.getElementById("list").onclick = function (event) {
    let target = (event || window.event).target || (event || window.event).srcElement;
    if (target.getAttribute("Class") === "fas fa-trash-alt") {
        let listen = target.parentElement.getElementsByClassName("listen-label")[0].innerHTML.split(':');
        delForward(listen[0].trim(), listen[1].trim())
    }
};
document.getElementById("add-btn").onclick = () => addForward();
window.onload = () => refresh();
