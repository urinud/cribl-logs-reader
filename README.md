# Cribl's Problem - Logs File Service
This project provides a Node.js service using Express.js to explore and filter log files under the `/var/log` directory. The service includes an API and a simple user interface for interacting with the logs.

## Features

1. **List Log Files**: Retrieve a list of all log files, including those in subdirectories.
2. **Filter Log Content**: Read log files in reverse order, applying optional filters based on regular expressions and limiting the number of returned lines.
3. **Simple UI**: A web-based user interface to interact with the APIs.

## Requirements
- Node.js (version 14 or higher)
- NPM

## Installation

1. Clone the repository or download the source code.
   ```bash
   git clone https://github.com/urinud/cribl-logs-reader.git
   cd cribl-logs-reader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Service

1. Start the server:
   ```bash
   node index.js
   ```

2. Open a browser and navigate to:
   ```
   http://localhost:3000
   ```

## API Endpoints

### 1. **List Log Files**

**Endpoint:**
```
GET /logs
```

**Response:**
A JSON object containing an array of file paths relative to `/var/log`.

**Example Response:**
```json
{
  "files": [
    "syslog",
    "subdir/error.log"
  ]
}
```

### 2. **Retrieve Filtered Log Content**

**Endpoint:**
```
GET /logs/:filename
```

**Path Parameters:**
- `filename`: The relative path to the log file (e.g., `syslog`, `subdir/error.log`).

**Query Parameters:**
- `regex` (optional): A regular expression to filter log lines (defaults: no filter).
- `lines` (optional): The number of lines to retrieve (default: 25).

**Example Request:**
```
GET /logs/syslog.log?regex=error&lines=10
```

**Example Response:**
```json
{
  "lines": [
    "2024-12-24 09:55:56 ERROR: Something went wrong",
    "2024-12-24 10:01:27 ERROR: Another error occurred"
  ]
}
```

## Using the User Interface
1. Open the home page at `http://localhost:3000`.
2. Use the **Fetch Logs** button to list available log files.
3. Enter the filename, optional regular expression, and number of lines to fetch filtered log content.
4. View the result in the displayed output area.

## Notes
- Ensure the `/var/log` directory and its subdirectories are accessible to the service.
- The application reads log files in reverse, filtering lines as it goes for optimal performance with large files.
- Default values:
  - `lines`: 25
  - No filter if `regex` is not specified.

## License
This project is licensed under the ISC License.

---
For any issues or questions, feel free to contact the maintainer or create an issue in the repository.

