const http = require("http");
const fs = require("fs");

const PORT = 3000;

http.createServer((req, res) => {

     res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === "POST" &&
        req.url === "/register") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            const user = JSON.parse(body);

            let users = [];

            try {
                users = JSON.parse(
                    fs.readFileSync(
                        "credentials.json",
                        "utf8"
                    )
                );
            }
            catch {}

            const existing =
                users.find(
                    u => u.email === user.email
                );

            if (existing) {

                res.writeHead(400);
                res.end(
                    JSON.stringify({
                        message:"Email already exists"
                    })
                );

                return;
            }

            const crypto = require("crypto");

            const hashedPassword =
                crypto
                .createHash("sha256")
                .update(user.password)
                .digest("hex");

            user.password = hashedPassword;

            users.push(user);

            fs.writeFileSync(
                "credentials.json",
                JSON.stringify(users,null,2)
            );

            res.writeHead(200);
            res.end(
                JSON.stringify({
                    message:"Registered"
                })
            );
        });

        return;
    }

    if (req.method === "POST" && req.url === "/login") {

    let body = "";

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", () => {

        const { email, password } = JSON.parse(body);

        let users = [];

        try {
            users = JSON.parse(
                fs.readFileSync("credentials.json", "utf8")
            );
        } catch {
            users = [];
        }

        const crypto = require("crypto");

        const hashedPassword =
            crypto.createHash("sha256")
                .update(password)
                .digest("hex");

        const user = users.find(u => u.email === email);

        if (!user) {
            res.writeHead(401, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({
                message: "User not found"
            }));
        }

        if (user.password !== hashedPassword) {
            res.writeHead(401, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({
                message: "Incorrect password"
            }));
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            message: "Login successful"
        }));
    });

    return;
    }
    res.writeHead(404);
    res.end();

}).listen(PORT);

console.log(`Server running on ${PORT}`);