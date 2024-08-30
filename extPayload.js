function Tab() {
    return html`
    <>
    `
}


let x = html`
<div><h1>Extension CodeExec</h1>
<input type="text" id=""/>

<h1>Tabs</h1>
<button type="button" id="refreshTabs">Refresh Tabs</button>
<div id="tabsList"></div>

<div id="extensionsList"></div>
</div>
`;
document.body.appendChild(x);

let manifest = chrome.runtime.getManifest();
let permissions = manifest.permissions ?? [];

if (permissions.includes("management")) {
    chrome.management.getAll(handleExtensions)
}

function handleExtensions(infoList) {
    for (let extension of infoList) {
        // TODO: Add functionality
    }
}

function tabItem(title, url) {
    let x = document.createElement("div");
    x.innerHTML = `${title} (${url})`;
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
updateTabList();
document.getElementById("refreshTabs").addEventListener("click", updateTabList);