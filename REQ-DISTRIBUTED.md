# Distributed Requests
Initial version has a list of known servers in `cloud-logs.js`.

## Features

4. **List Distributed Servers**: Retrieve a list of known available servers. It initialize with its own server.
5. **Add Distributed Server**: Add a server to the list known available servers.
6. **Distributed List Log Files**: Invokes all the known servers and returns a list of all log files, including those in subdirectories.
7. **Distributed Filter Log Content**: Invokes all the known servers and returns a list of log contents, optionally filtering with a regular expression and limiting the number returned lines.

## API Endpoints

### 4. **List Distributed Servers**

**Endpoint:**
```
GET /cloud/servers
```

**Response:**
A JSON object containing a list of objects, each object has `name`, `host` and `port`.

**Example Response:**
```json
[
    {
        "name": "local",
        "host": "localhost",
        "port": 3000
    },
    {
        "name": "remote1",
        "host": "192.168.0.27",
        "port": 3000
    }
]
```

### 5. **Add Distributed Server**

**Endpoint:**
```
POST /cloud/servers
{
    "name": "remote1",
    "host": "192.168.0.27",
    "port": 3000
}
```

**Response:**
Status 201 and a success message.

### 6. **Distributed List Log Files**

**Endpoint:**
```
GET /cloud/logs
```

**Response:**
A JSON object containing and array of object. Each object contains the server `name` and an array of file paths relative to the logs directory.

**Example Response:**
```json
[
    {
        "server": "local",
        "logs": {
            "files": [
                "alf.log",
                "install.log",
                "shutdown_monitor.log",
                "system.log",
                "com.apple.xpc.launchd/launchd.log"
            ]
        }
    },
    {
        "server": "remote1",
        "logs": {
            "files": [
                "alf.log",
                "fsck_apfs_error.log",
                "install.log",
                "shutdown_monitor.log",
                "system.log",
                "wifi.log",
                "com.apple.xpc.launchd/launchd.log",
                "com.apple.xpc.launchd/launchd.log.1"
            ]
        }
    }
]
```

### 7. **Distributed Filter Log Content**

**Endpoint:**
```
GET /cloud/logs/:filename
```

**Path Parameters:**
- `filename`: The relative path to the log file (e.g., `syslog`, `subdir/error.log`).

**Query Parameters:**
- `regex` (optional): A regular expression to filter log lines (defaults: no filter).
- `lines` (optional): The number of lines to retrieve (default: 25).

**Example Request:**
```
GET /cloud/logs/syslog.log?regex=error&lines=10
```

**Example Response:**
```json
[
    {
        "server": "local",
        "lines": [
            "2024-12-24 09:55:56 ERROR: Something went wrong",
            "2024-12-24 10:01:27 ERROR: Another error occurred"
        ]
    },
    {
        "server": "remote1",
        "lines": [
            "2024-12-24 09:55:56 ERROR: Server timeout",
            "2024-12-24 10:01:27 ERROR: Random error ocurred"
        ]
    }
]
```

## Notes
- This is just an initial version. The list of available servers should be obtained from centralized cache or another repository.
- The API to add a server is for testing purposes right now. For real usage CRUD need to be implemented.
- The is not UI for the distributed version of the methods.
