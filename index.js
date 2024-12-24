const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const LOG_DIR = '/var/log';

// Returns the list of log files in the log directory
app.get('/logs', (req, res) => {
    fs.readdir(LOG_DIR, (err, files) => {
        if (err) {
            console.error('Error reading log directory: ' + err);
            return res.status(500).send('Unable to read log directory: ' + err);
        } else {
            const logFiles = files.filter(file => fs.statSync(path.join(LOG_DIR, file)).isFile());
            res.json({ files : logFiles });
        }
    });
});

// Returns the content of the log file
app.get('/logs/:filename', (req, res) => {
   const { filename } = req.params;
   const { regex, lines } = req.query;
   const filePath = path.join(LOG_DIR, filename);

   if (!fs.existsSync(filePath)) {
       return res.status(404).send('File not found');
   }

   try {
       const lines = [];
       res.json({ lines : lines });
   } catch (err) {
       console.error('Error reading log file: ' + err);
       res.status(500).send('Unable to read log file ' + filename + ' with error: ' + err);
   }
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);
