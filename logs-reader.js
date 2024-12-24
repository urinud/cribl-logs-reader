const fs = require("fs");
const config = require("./config");

function readLogFile(filePath, lineCount, regexPattern) {
  // Get File Info
  const stats = fs.statSync(filePath);
  let remainingBytes = stats.size;
  let buffer = "";
  // Read File
  const filteredLines = [];
  const fd = fs.openSync(filePath, "r");
  while (remainingBytes > 0 && filteredLines.length < lineCount) {
    const readSize = Math.min(config.BUFFER_SIZE, remainingBytes);
    const readBuffer = Buffer.alloc(readSize);
    fs.readSync(fd, readBuffer, 0, readSize, remainingBytes - readSize);
    buffer = readBuffer.toString("utf8") + buffer;
    const bufferLines = buffer.split("\n");
    buffer = bufferLines.shift(); // Remove last line as it may be incomplete
    // Add lines to the result
    for (
      let i = bufferLines.length - 1;
      i >= 0 && filteredLines.length < lineCount;
      i--
    ) {
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
  return filteredLines;
}

module.exports = {
    readLogFile
};