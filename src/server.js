const chokidar = require("chokidar");
const ngrok = require("ngrok");
const fs = require("fs");

const WebSocket = require("ws");

const PCW_IGNORE = ".psw-ignore";

function createKey(payload) {
    return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function getIgnoredFiles() {
    return JSON.parse(fs.readFileSync(PCW_IGNORE, { encoding: "utf-8" }));
}

module.exports = (argv) => {
    console.log("Starting development server...");

    const wss = new WebSocket.Server({
        port: 3984
    });

    wss.on("listening", () => {
        ngrok.connect({
            proto: "tcp",
            addr: 3984
        }).then(url => {
            url = url.replace("tcp", "ws");

            const accessKey = createKey({
                url: url
            });

            console.log("Your access key:", accessKey);

            wss.on("connection", ws => {
                console.log("Client connected");
            });

            const notify = (event, path, stats) => {
                let obj = {
                    type: event,
                    path: path
                };

                switch (event) {
                    case "add":
                    case "change":
                        obj.data = fs.readFileSync(path, { encoding: "base64" });
                        break;
                }

                wss.clients.forEach(client => {
                    client.send(JSON.stringify(obj));
                });
            };

            const watcher = chokidar.watch(".");

            watcher.on("add", (path, stats) => {
                notify("add", path, stats);
            });

            watcher.on("unlink", path => {
                notify("delete", path);
            });

            watcher.on("change", path => {
                notify("change", path);
            });

            if (fs.existsSync(PCW_IGNORE)) {
                watcher.unwatch(getIgnoredFiles());
            }
        });
    });
};