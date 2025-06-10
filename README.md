# 📄 DevOps-Ready Print Submission System

A Node.js-based secure print submission system with frontend upload UI, printer preset automation, and GUI scripting integration for macOS. Built for managing institutional printing workflows with flexibility and automation.

---

## 📦 Features

* ✅ File upload (PDF/JPG) via HTML form
* ✅ Custom printer category selection (Color / Fiery)
* ✅ Mac automation with `cliclick` and AppleScript
* ✅ Dynamic renaming and directory management
* ✅ Frontend validation (JS)
* ✅ Full control over `lp` print commands

---

## 🚀 Tech Stack

| Layer        | Tech                      |
| ------------ | ------------------------- |
| Frontend     | HTML, CSS, JS             |
| Backend      | Node.js (Express)         |
| Automation   | AppleScript, `cliclick`   |
| File Upload  | `multer`                  |
| OS Commands  | `lp`, `osascript`, `exec` |
| Logging      | `winston`                 |
| DevOps Tools | Docker, GitHub Actions    |

---

## 🛠 Setup Instructions

### 💻 Install Docker (macOS)

```bash
brew install --cask docker
```

Then:

1. Open the Docker app from Applications (or with Spotlight).
2. Wait until it says "Docker is running" (look for 🐳 in the menu bar).
3. Confirm installation:

```bash
docker --version
```

### 1. Install Dependencies

```bash
brew install node
npm install
```

### 2. Install `cliclick` (required for GUI automation)

```bash
brew install cliclick
```

### 3. Run the Server

```bash
node server.js
```

Open your browser at: `http://localhost:3000`

---

## 🐳 Docker Support

### Dockerfile

```Dockerfile
# Use a lightweight Node.js base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Step 1: Copy only the dependency files first
COPY package*.json ./

# Step 2: Install dependencies
RUN npm install

# Step 3: Copy the rest of the application files
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Build & Run

```bash
docker build -t print-server .
docker run -p 3000:3000 --env-file .env print-server
```

> Note: `cliclick` and macOS-only automation scripts will **not run inside Docker**, but the web app logic and endpoints will.

---

## 🔁 GitHub Actions: CI Pipeline

Create a file: `.github/workflows/node-ci.yml`

```yaml
name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    - name: Install dependencies
      run: npm install
    - name: Build Docker image
      run: docker build -t print-server .
```

---

## 📄 Environment Variables

### ✅ Create `.env` file:

```env
PORT=3000
CLICLICK_PATH=/opt/homebrew/bin/cliclick
PRINTER_DEFAULT=color
```

### ✅ Use inside `server.js`:

```js
require('dotenv').config();

const port = process.env.PORT || 3000;
const cliclickPath = process.env.CLICLICK_PATH || '/opt/homebrew/bin/cliclick';
const printerDefault = process.env.PRINTER_DEFAULT || 'color';
```

### ✅ Install dotenv:

```bash
npm install dotenv
```

### ✅ Optional: `.env.example` file

```env
PORT=3000
CLICLICK_PATH=/your/path/to/cliclick
PRINTER_DEFAULT=color
```

> 💡 Keep `.env` in `.gitignore` to avoid leaking sensitive configuration.

---


## 👤 Oren Ohayon

This project was built as a demonstration of hybrid automation + DevOps thinking.

