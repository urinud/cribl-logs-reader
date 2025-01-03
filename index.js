const express = require("express");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const logsReader = require("./logs-reader");
const cloudLogs = require("./cloud-logs");

const app = express();

// Configure Static Content
app.use(express.static("public"));
app.use(express.json());

// Returns the list of log files in the log directory
app.get("/logs", (req, res) => {
  fs.readdir(config.LOG_DIR, { recursive: true }, (err, files) => {
    if (err) {
      console.error("Error reading log directory: " + err);
      return res.status(500).send("Unable to read log directory: " + err);
    } else {
      const logFiles = files.filter((file) =>
        fs.statSync(path.join(config.LOG_DIR, file)).isFile()
      );
      res.json({ files: logFiles });
    }
  });
});

// Returns the content of the log file
app.get("/logs/:filename(*)", (req, res) => {
  const { filename } = req.params;
  const { regex, lines } = req.query;
  // Validate filename
  if (filename.includes("..")) {
    console.log("Invalid filename: " + filename);
    return res.status(403).send("Invalid filename");
  }
  const normalizedFilename = path.normalize(filename);
  const sanitizedFilename = normalizedFilename.replace(/^(\.\.(\/|\\|$))+/, "");

  const filePath = path.join(config.LOG_DIR, sanitizedFilename);

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

  const regexPattern = regex ? new RegExp(regex) : null;

  try {
    const filteredLines = logsReader.readLogFile(
      filePath,
      lineCount,
      regexPattern
    );
    res.json({ lines: filteredLines });
  } catch (err) {
    console.error("Error reading log file: " + err);
    res
      .status(500)
      .send("Unable to read log file " + filename + " with error: " + err);
  }
});

// Returns the list of known servers
app.get("/cloud/servers", (req, res) => {
  res.json(cloudLogs.getKnownServers());
});

// Adds a new server to the list of known servers
app.post("/cloud/servers", (req, res) => {
  if (!req.body?.name || !req.body?.host || !req.body?.port) {
    return res.status(400).send("Invalid request body");
  }
  cloudLogs.addServer({
    name: req.body.name,
    host: req.body.host,
    port: req.body.port,
  });
  res.status(201).send("Server added successfully");
});

// Returns the list of log files from all known servers
app.get("/cloud/logs", (req, res) => {
  cloudLogs.getAllLogFiles((logs) => {
    res.json(logs);
  });
});

// Returns the content of the log file from all known servers
app.get("/cloud/logs/:filename(*)", (req, res) => {
  const { filename } = req.params;
  const { regex, lines } = req.query;

  cloudLogs.getAllLogs(filename, lines, regex, (logs) => {
    res.json(logs);
  });
});

app.listen(config.PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " +
        config.PORT
    );
  else console.log("Error occurred, server can't start", error);
});
