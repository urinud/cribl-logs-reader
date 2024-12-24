const http = require("http");
const config = require("./config");

const knownServers = [{ name: "local", host: "localhost", port: config.PORT }];

function getKnownServers() {
  return knownServers;
}

function addServer(server) {
  knownServers.push(server);
}

function getAllLogs(callback) {
  Promise.all(knownServers.map(getServerLogs)).then((logs) => {
    callback(logs);
  });
}

function getServerLogs(server) {
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

module.exports = { getKnownServers, addServer, getAllLogs };
