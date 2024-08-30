function Tab() {
    return html`
    <>
    `
}


let x = html`
<h1>Extension CodeExec</h1>
<input type="text" id=""/>



`;
document.body.appendChild(x);

chrome.tabs.query({}, (x) => x.forEach((x) => {
    
}))