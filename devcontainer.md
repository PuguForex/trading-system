# Dev Container Setup – Secure Development Environment

## 1. Why We Implemented Dev Containers

Security and safety are top priorities in this project. Recent supply chain attacks (e.g., compromised npm packages) have shown that:

* Installing dependencies can execute malicious code (`postinstall` scripts)
* Developer machines can be compromised during development (not just production)
* Sensitive data (API keys, environment variables, source code) can be exposed

### Goals

* Isolate development environment from host system (Windows)
* Contain potential malicious code execution
* Create a reproducible and consistent environment
* Improve long-term security practices for all future projects

---

## 2. What is a Dev Container?

A Dev Container is a **Docker-based isolated environment** where:

* Your project runs inside a **Linux container**
* VS Code connects to it remotely
* All tools (Node.js, npm, etc.) run inside the container

### Architecture

```
Windows (Host)
 └── VS Code (UI)
      └── Docker Container (Linux)
           └── Node.js + npm + Project
```

---

## 3. Setup Steps

### Step 1: Install Requirements

* Docker Desktop (already installed)
* VS Code Extension:

  * Dev Containers

---

### Step 2: Create Configuration

Created folder:

```
.devcontainer/
```

Created file:

```
.devcontainer/devcontainer.json
```

---

### Step 3: Configuration Used

```json
{
  "name": "trading-system-dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",

  "workspaceFolder": "/workspaces/trading-system",

  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  },

  "postCreateCommand": "npm install",

  "remoteUser": "node"
}
```

---

### Step 4: Launch Container

In VS Code:

* Command Palette → `Dev Containers: Reopen in Container`

---

### Step 5: Verify Environment

Inside container:

```
node -v
npm -v
pwd
```

Expected:

```
/workspaces/trading-system
```

---

## 4. What We Achieved

### 🛡️ Security Improvements

* npm installs now run inside container (not Windows)
* Malicious scripts are contained within container
* Access to host system is restricted
* Reduced risk of:

  * Credential theft
  * File system access
  * Persistent malware

---

### 🔁 Reproducibility

* Same environment every time
* No dependency on local machine setup
* Easy onboarding for future projects or developers

---

### 🧱 Isolation

* Project runs in Linux environment
* Cannot access:

  * Personal files
  * Other applications
  * System-level resources (unless explicitly allowed)

---

## 5. Key Behavioral Differences

### 5.1 Environment

| Before  | After             |
| ------- | ----------------- |
| Windows | Linux (container) |

---

### 5.2 Terminal Commands

| Windows (PowerShell) | Container (Linux) |
| -------------------- | ----------------- |
| Remove-Item          | rm                |
| dir                  | ls                |

---

### 5.3 Node & npm

* Previously: Windows installation
* Now: Container-based Node.js

---

### 5.4 File System

* Project folder is mounted into container
* Container sees only exposed workspace

---

### 5.5 Port Forwarding

* Apps run inside container
* Automatically accessible via:

  ```
  http://localhost:PORT
  ```

---

### 5.6 Extensions

* Extensions are installed **inside container**
* Separate from local VS Code extensions
* Defined in `devcontainer.json`

---

## 6. Important Rules Going Forward

### ✅ Always Do

* Run `npm install` inside container
* Use container terminal for development
* Keep `.devcontainer` committed to Git

---

### ❌ Avoid

* Running npm commands on host machine
* Installing dependencies outside container
* Mixing host and container environments

---

## 7. Limitations & Considerations

* Slight performance overhead (acceptable tradeoff)
* Requires Docker to be running
* Linux environment differences (minor learning curve)

---

## 8. When Container Stops

If Docker is closed:

* Container stops
* VS Code disconnects

Recovery:

1. Start Docker Desktop
2. Reopen project
3. Reconnect to container

---

## 9. Why This Matters Long-Term

This setup enables:

* Safe experimentation with new dependencies
* Protection against supply chain attacks
* Scalable and professional development workflow
* Foundation for:

  * CI/CD pipelines
  * Cloud development environments
  * Secure team collaboration

---

## 10. Key Takeaway

> Development environment is now **isolated, reproducible, and secure by design**

This is a major step toward **professional-grade software engineering practices**.
