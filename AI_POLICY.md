# AI Behavior Policy

## 🔐 Security Rules

- Do NOT access `.env.secrets`
- Do NOT attempt to bypass `loadSecrets()` restrictions
- Do NOT suggest hardcoding secrets
- Do NOT suggest disabling security layers

## 📁 File Access

- Allowed: /apps, /src
- Restricted: /config/secrets, .env files

## ⚙️ Command Safety

- Avoid destructive commands (rm -rf, etc.)
- Do not install unknown packages without justification
- Do not fetch remote scripts (curl | bash)

## 🌐 Network

- Do not suggest sending data to unknown external APIs
- Only use approved endpoints

## 🧠 Development Behavior

- Prefer minimal, explicit, and safe changes
- Respect existing architecture and security design

## 🔄 Context Loss Protocol

- Never infer current project state from training data
- If context is unclear, explicitly state it — do not guess
- Always request SESSION.md first as the re-entry point
- Then request FOUNDATION.md for full architecture context
- Never proceed with architectural changes without reading FOUNDATION.md
- If SESSION.md and FOUNDATION.md conflict, FOUNDATION.md wins
