console.log("hello world");

// chrome.action.onClicked.addListener((() => {
//     chrome.tabs.create({url: "https://lobby.ogame.gameforge.com/"})
// }));

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == "notification") {
        console.log(request.message);
        chrome.notifications.create("", request.message);
        return sendResponse(request.message);
    }
});