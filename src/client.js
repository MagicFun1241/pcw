const chokidar = require("chokidar");
const mkdirp = require("mkdirp");
const path = require("path");
const fs = require("fs");

const WebSocket = require("ws");

const PCW_IGNORE = ".psw-ignore";

module.exports = argv => {
    const keyData = JSON.parse(Buffer.from(argv.key, "base64").toString());

    const ws = new WebSocket(keyData.url);
    const watcher = chokidar.watch(".");

    const notify = (event, path) => {
        let obj = {
            type: event,
            path: path
        };

        switch (event) {
            case "add":
                
                break;
        }

        ws.send(JSON.stringify(obj));
    };

    watcher.on("add", path => {

    });

    ws.on("message", data => {
        const message = JSON.parse(data);

        switch (message.type) {
            case "add":
                const dir = path.dirname(message.path);

                if (!fs.existsSync(dir)) mkdirp.sync(dir);

                fs.writeFileSync(message.path, Buffer.from(message.data, "base64"));
                break;

            case "delete":
                fs.unlink(message.path, () => {});
                break;

            case "change":
                fs.writeFileSync(message.path, Buffer.from(message.data, "base64"));
                break;
        
            default:
                console.error(`Unknown event type named '${message.type}'`);
                break;
        }
    });
};