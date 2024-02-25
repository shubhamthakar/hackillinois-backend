const WebSocket = require("ws");
const os = require("os");
const pty = require("node-pty");
const pipeline = require("stream");

// const WebSocketServer = require("ws");
// const createWebSocketStream = require("ws");

// const pty = require("node-pty");
// const wss = new WebSocketServer({ port: 8080 });

// wss.on("connection", (ws) => {
//   console.log("new connection");

//   const duplex = createWebSocketStream(ws, { encoding: "utf8" });

//   const proc = pty.spawn("docker", ["run", "--rm", "-ti", "ubuntu", "bash"], {
//     name: "xterm-color",
//   });

//   const onData = proc.onData((data) => duplex.write(data));

//   const exit = proc.onExit(() => {
//     console.log("process exited");
//     onData.dispose();
//     exit.dispose();
//   });

//   duplex.on("data", (data) => proc.write(data.toString()));

//   ws.on("close", function () {
//     console.log("stream closed");
//     proc.kill();
//     duplex.destroy();
//   });
// });

const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const { container_id } = JSON.parse(body);
      // Handle the container_id parameter here

      const shell = os.platform() === "win32" ? "bash.exe" : "bash";

      const wss = new WebSocket.Server({ port: 8080 }, () => {
        console.log("WebSocket server is running on port 8080");
        console.log(os.platform());
      });

      wss.on("connection", (ws) => {
        const ptyProcess = pty.spawn(shell, ["-i"], {
          // '-i' for interactive shell
          name: "xterm-color",
          cwd: process.env.HOME,
          env: process.env,
        });

        // Send the script to the shell to be sourced/executed
        ptyProcess.write(`docker exec -it ${container_id} /bin/sh \n`);

        // wss.on("connection", (ws) => {
        //   const ptyProcess = pty.spawn(shell, ["sample_script.sh"], {
        //     name: "xterm-color",
        //     cwd: process.env.HOME,
        //     env: process.env,
        //   });

        //   (async (stream) => {
        //     for await (const chunk of stream) {
        //       ptyProcess.write(chunk.toString());
        //     }
        //   })(process.stdin).catch(console.warn);

        //   (async (stream) => {
        //     for await (const chunk of stream) {
        //       process.stdout.write(chunk.toString());
        //     }
        //   })(ptyProcess).catch(console.warn);

        ptyProcess.on("data", (data) => {
          ws.send(data);
        });

        ws.on("message", (message) => {
          ptyProcess.write(message);
        });

        ws.on("close", () => {
          ptyProcess.kill();
        });
      });

      console.log(`Received container_id: ${container_id}`);
      res.statusCode = 200;
      res.end("Success");
    });
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

const port = 3030;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
