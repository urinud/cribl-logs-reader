const http = require("http");
const config = require("./config");
const path = require("path");

const knownServers = [{ name: "local", host: "localhost", port: config.PORT }];

function getKnownServers() {
  return knownServers;
}

function addServer(server) {
  knownServers.push(server);
}

function getAllLogFiles(callback) {
  Promise.all(knownServers.map(getServersLogFiles)).then((logs) => {
    callback(logs);
  });
}

function getServersLogFiles(server) {
  return new Promise((resolve, reject) => {
    const options = {
      host: server.host,
      port: server.port,
      path: "/logs",
    };
    http.get(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({ server: server.name, logs: JSON.parse(data) });
      });
      res.on("error", (err) => {
        reject(err);
      });
    });
  });
}

function getAllLogs(filename, lines, regex, callback) {
  Promise.all(
    knownServers.map((server) => getServersLogs(server, filename, lines, regex))
  ).then((logs) => {
    callback(logs);
  });
}

function getServersLogs(server, filename, lines, regex) {
  return new Promise((resolve, reject) => {
    // Prepare GET
    const query = new URLSearchParams();
    if (regex) {
      query.append("regex", regex);
    }
    if (lines) {
      query.append("lines", lines);
    }
    const options = {
      host: server.host,
      port: server.port,
      path: `/logs/${filename}?${query.toString()}`,
    };
    http.get(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({ server: server.name, lines: JSON.parse(data).lines });
      });
      res.on("error", (err) => {
        reject(err);
      });
    });
  });
}

module.exports = { getKnownServers, addServer, getAllLogFiles, getAllLogs };
