let x = html`
<div><h1>Extension Code Execution</h1>
<input type="text" id="script"/>
<button type="button" id="runScript">Execute</button>

<h1>Tabs</h1>
<button type="button" id="refreshTabs">Refresh Tabs</button>
<div id="tabsList"></div>


<button type="button" id="refreshExtensions">Refresh Extensions</button>
<div id="extensionsList"></div>
</div>
`;
document.body.appendChild(x);

let manifest = chrome.runtime.getManifest();
let permissions = manifest.permissions ?? [];

async function refreshList() {
    let extList = document.getElementById("extensionsList");
    extList.innerHTML = "";
    let infoList = await getAll();
    for (let extension of infoList) {
        let [a, b]  = extItem(extension.name, extension.id, extension.enabled);
        extList.appendChild(a);
        extList.appendChild(b);
    }
}

document.getElementById("runScript").addEventListener("click", function () {
    try {
        eval(document.getElementById("script").value);
    } catch (err) {
        console.log("Error while executing script: ");
        console.error(err);
        alert(`Error while executing script: ${err}`);
    }
});

// Polyfill: We need to support MV2, which uses callbacks and does not support returning Promises like MV3 does
function getAll() {
    return new Promise((resolve, _reject) => chrome.management.getAll(resolve));
}
function setEnabled(id, enabled) {
    return new Promise((resolve, _reject) => chrome.management.setEnabled(id, enabled, resolve));
}
function get(id) {
    return new Promise((resolve, _reject) => chrome.management.get(id, resolve));
}


function extItem(title, id, enabled) {
    let text = document.createElement("div");
    text.textContent = `${title} (${id}, Currently ${enabled? "enabled" : "disabled"})`;
    let btn = document.createElement("button");
    btn.type = "button";
    btn.id = `toggle${id}`;
    btn.innerText = enabled ? "Disable": "Enable";
    x.appendChild(text);
    x.appendChild(btn);
    btn.addEventListener("click", async () => {
        await setEnabled(id, !enabled);
        let ext = await get(id);
        if (ext.enabled != enabled) {
            alert("Success");
            refreshList();
        } else {
            alert("Failed to disable extension");
        }
    });
    return [text, btn];
}

function tabItem(title, url) {
    let x = document.createElement("div");
    x.textContent = `${title} (${url})`;
    return x;
}
let tabList = document.getElementById("tabsList");

function updateTabList() {
    tabList.innerHTML = "";
    chrome.tabs.query({}, (x) => x.forEach((x) => {
        let title = x.title;
        let url = x.url;
        if (!title) {
            title = "info not available";
            url = "does this extension have the 'tabs' permission?"
        }
        let item = tabItem(title, url);
        tabList.appendChild(item);
    }));
}

if (permissions.includes("management")) {
    await refreshList();
}

updateTabList();
document.getElementById("refreshTabs").addEventListener("click", updateTabList);