var ConnectionFrom = document.getElementById("connectionFrom");
var ConnectionUrl = document.getElementById("connectionUrl");
var ConnectButton = document.getElementById("connectionButton");
var stateLabel = document.getElementById("statuslabel");
var SendMessage = document.getElementById("sendMessage");
var SendButton = document.getElementById("sendButton");
var SendFrom = document.getElementById("sendFrom");
var CloseButton = document.getElementById("closeButton");
var commsLog = document.getElementById("commsLog");
var Socket;
var scheme = document.location.protocol === "https" ? "wss" : "ws"; 
var port = document.location.port ? (":" + document.location.port) : "";
ConnectionUrl.value = scheme + "://" + document.location.hostname + port + "/ws";

function UpdateState() {
    function disable() {
        SendMessage.disabled = true;
        SendButton.disabled = true;
        CloseButton.disabled = true;
    }
    function enable() {
        SendMessage.disabled = false;
        SendButton.disabled = false;
        CloseButton.disabled = false;
    }
    ConnectionUrl.disabled = true;
    ConnectButton.disabled = true;
    if (!Socket) {
        disable();
    } else {
        switch (Socket.readyState) {
            case WebSocket.CLOSED:
                stateLabel.innerHTML = "Closed";
                disable();
                ConnectionUrl.disabled = false;
                ConnectButton.disabled = false;
                break;
            case WebSocket.CLOSING:
                stateLabel.innerHTML = "Closing";
                disable();
                break;
            case WebSocket.CONNECTING:
                stateLabel.innerHTML = "Connecting";
                disable();
                break;
            case WebSocket.OPEN:
                stateLabel.innerHTML = "Open";
                enable();
                break;
            default:
                stateLabel.innerHTML = "UnKnow Websocket State: " + htmlEscape(Socket.readyState);
                disable();
        }
    }
}

CloseButton.onclick = function () {
    if (!Socket|| Socket.readyState!== WebSocket.OPEN) {
        alert("Websocket Not Connected");
    }
    Socket.close(1000, "Closing From Client");
}

SendButton.onclick = function () {
    if (!Socket || Socket.readyState !== WebSocket.OPEN) {
        alert("Websocket Not Connected");
    }
    var data = SendMessage.value;
    Socket.send(data);
    commsLog.innerHTML += '<tr>' +
        '<td class"commslog-client">Client</td>' +
        '<td class"commslog-server">Server</td>' +
        '<td class"commslog-data">'+htmlEscape(data)+'</td></tr>';


}

ConnectButton.onclick = function () {
    stateLabel.innerHTML = "Connection......";
    Socket = new WebSocket(ConnectionUrl.value);
    Socket.onopen = function (event) {
        UpdateState();
        commsLog.innerHTML = '<tr>' +
            '<td colspan="3" class="commslog-data">Connection Opened </td>'+
            '</tr>';

    }
    Socket.onclose = function (event) {
        commsLog.innerHTML = '<tr>' +
            '<td colspan="3" class="commslog-data">Connection Closed. code' + htmlEscape(event.code) + '. Reason' + htmlEscape(event.readyState) +
            '</tr>';
    }
    Socket.onerror = UpdateState;

    Socket.onmessage = function (event) {
        console.log("Data masuk=>"+event.data);
        commsLog.innerHTML += '<tr>' +
            '<td class"commslog-client">Client</td>' +
            '<td class"commslog-server">Server</td>' +
            '<td class"commslog-data">' + htmlEscape(event.data) + '</td></tr>';
    }
}

function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}