# Commands Reference

## Project Setup

npm init -y

# Initializes Node project

npm install typescript --save-dev

# Installs TypeScript as dev dependency

npx tsc --init

# Creates tsconfig.json

---

## TypeScript Compilation & Execution

npx tsc

# Compiles TypeScript to JavaScript

node dist/index.js

# Runs compiled application

node dist/index.js data/trades.json EURUSD

# Runs with CLI arguments (file path + symbol filter)

---

## Dependencies

npm install @types/node --save-dev

# Adds Node.js type definitions

npm install zod

# Installs Zod for runtime validation

---

## Git (Source Control)

git init

# Initialize Git repository

git status

# Check current changes

git add .

# Stage all changes

git commit -m "message"

# Commit staged changes

git log --oneline

# View commit history
