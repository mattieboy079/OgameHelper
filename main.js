function injectScript(path, cb, module = false) {
    console.log("Inject script: " + path);
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL(path);
    if (module) {
      s.type = "module";
    }
    (document.head || document.documentElement).appendChild(s);
    s.onload = () => {
      s.remove();
      cb && cb();
    };
}

window.addEventListener("DOMContentLoaded", (event) => {
    console.log("eventListener added");
    injectScript("ogameHelper.js", null, true);
});