const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const LOG_DIR = "/var/log";
const BUFFER_SIZE = 1024; // 1KB

// Configure Static Content
app.use(express.static("public"));

// Returns the list of log files in the log directory
app.get("/logs", (req, res) => {
  fs.readdir(LOG_DIR, (err, files) => {
    if (err) {
      console.error("Error reading log directory: " + err);
      return res.status(500).send("Unable to read log directory: " + err);
    } else {
      const logFiles = files.filter((file) =>
        fs.statSync(path.join(LOG_DIR, file)).isFile()
      );
      res.json({ files: logFiles });
    }
  });
});

// Returns the content of the log file
app.get("/logs/:filename", (req, res) => {
  const { filename } = req.params;
  const { regex, lines } = req.query;
  const filePath = path.join(LOG_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  const lineCount = lines ? parseInt(lines) : 25;
  if (isNaN(lineCount) || lineCount <= 0) {
    return res
      .status(400)
      .send(
        "Invalid lines count. Check lines parameter, must be positive integer"
      );
  }

  try {
    // Prepara Vars
    const regexPattern = regex ? new RegExp(regex) : null;
    const filteredLines = [];
    // Get File Info
    const stats = fs.statSync(filePath);
    let remainingBytes = stats.size;
    let buffer = '';
    // Read File
    const fd = fs.openSync(filePath, 'r');
    while (remainingBytes > 0 && filteredLines.length < lineCount) {
        const readSize = Math.min(BUFFER_SIZE, remainingBytes);
        const readBuffer = Buffer.alloc(readSize);
        fs.readSync(fd, readBuffer, 0, readSize, remainingBytes - readSize);
        buffer = readBuffer.toString('utf8') + buffer;
        const bufferLines = buffer.split('\n');
        buffer = bufferLines.shift(); // Remove last line as it may be incomplete
        // Add lines to the result
        for (let i = bufferLines.length - 1; i >= 0 && filteredLines.length < lineCount; i--) {
            const line = bufferLines[i];
            if (line && (!regexPattern || regexPattern.test(line))) {
                filteredLines.push(line);
            }
        }
        remainingBytes -= readSize;
    }
    if (buffer) {
        if (!regexPattern || regexPattern.test(buffer)) {
            filteredLines.push(buffer);
        }
    }
    fs.closeSync(fd);
    res.json({ lines: filteredLines });
  } catch (err) {
    console.error("Error reading log file: " + err);
    res
      .status(500)
      .send("Unable to read log file " + filename + " with error: " + err);
  }
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
