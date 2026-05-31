const http = require("http");
const fs = require("fs");

const PORT = 3000;

http.createServer((req, res) => {

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

    res.writeHead(404);
    res.end();

}).listen(PORT);

console.log(`Server running on ${PORT}`);