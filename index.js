import http from "http";
import path from "path";
import { spawn } from "child_process";
import express from "express";
import { Server as SocketIO } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

let ffmpegProcess = null;

app.use(express.static(path.resolve("./public")));
app.use(express.json());

app.post("/start-stream", (req, res) => {
  const { secretKey } = req.body;
  if (!secretKey) return res.json({ success: false });

  if (ffmpegProcess) ffmpegProcess.kill("SIGINT");

  const options = [
    "-i", "-",
    "-c:v", "libx264", "-preset", "ultrafast", "-tune", "zerolatency",
    "-r", "25", "-g", "50", "-keyint_min", "25", "-crf", "25",
    "-pix_fmt", "yuv420p", "-sc_threshold", "0", "-profile:v", "main", "-level", "3.1",
    "-c:a", "aac", "-b:a", "128k", "-ar", "32000", "-f", "flv",
    `rtmp://a.rtmp.youtube.com/live2/${secretKey}`
  ];

  ffmpegProcess = spawn("ffmpeg", options);

  ffmpegProcess.stderr.on("data", (d) => console.error("ffmpeg:", d.toString()));
  ffmpegProcess.on("close", (c) => console.log("ffmpeg exited with code:", c));

  res.json({ success: true });
});

io.on("connection", socket => {
  console.log("Socket Connected", socket.id);
  socket.on("binarystream", stream => {
    if (ffmpegProcess && ffmpegProcess.stdin.writable) {
      ffmpegProcess.stdin.write(stream, (err) => {
        if (err) console.error("stdin write error", err);
      });
    }
  });
});

server.listen(3000, () => console.log(`HTTP Server running on PORT 3000`));
