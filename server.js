const http = require("http");
const { v4: uuidv4 } = require('uuid');
const errHead = require("./errHead");

let data = [];

const requestListener = (req, res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }
    let body = "";
    req.on("data", (chunk) => body += chunk)
    if (req.url === "/todos" && req.method === "GET") {
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "method": "GET",
            "action": "取得所有待辦",
            "status": "success",
            "data": data
        }));
        res.end();
    } else if (req.url === "/todos" && req.method === "POST") {
        req.on("end", () => {
            try {
                if (JSON.parse(body).title !== undefined) {
                    let item = {
                        "title": JSON.parse(body).title,
                        "id": uuidv4()
                    }
                    data.push(item);
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "method": "POST",
                        "action": "新增單筆待辦",
                        "status": "success",
                        "data": data
                    }));
                    res.end();
                } else {
                    errHead(res);
                }
            } catch (err) {
                errHead(res);
            }
        })
    } else if (req.url === "/todos" && req.method === "DELETE") {
        data.length = 0;
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "method": "DELETE",
            "action": "刪除所有待辦",
            "status": "success",
            "data": data
        }));
        res.end();
    } else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
        let id = req.url.split("/").pop();
        let index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data.splice(index, 1);
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "method": "DELETE",
                "action": "刪除單筆待辦",
                "status": "success",
                "data": data
            }));
            res.end();
        } else {
            errHead(res);
        }

    } else if (req.url.startsWith("/todos/") && req.method === "PATCH") {
        req.on("end", () => {
            try {
                let id = req.url.split("/").pop();
                let index = data.findIndex(item => item.id === id);
                if (JSON.parse(body).title !== undefined && index !== -1) {
                    data[index].title = JSON.parse(body).title;
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "method":"PATCH",
                        "action":"編輯單筆待辦",
                        "status":"success",
                        "data": data
                    }));
                    res.end();
                } else {
                    errHead(res);
                }
            } catch (err) {
                errHead(res);
            }
        })
    } else if (req.method === "OPTIONS") {
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": data
        }));
        res.end();
    } else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "路由錯誤"
        }));
        res.end();
    }
}

const serverOpen = http.createServer(requestListener);

serverOpen.listen(process.env.PORT || 3005);