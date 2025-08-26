Project cleanup summary (Aug 2025)

- Consolidated /api/config to a single endpoint in server.js.
- Removed redundant CORS debug middleware; kept standard CORS allowlist.
- Fixed password field usage: consistently use password_hash in DB ops.
- Trimmed noisy console logs in frontend (account, header-footer, cart, O_nas).
- Removed duplicate/obsolete newsletter route; kept unified version.
- Simplified routes/users.js as placeholder to avoid dead incomplete code.
- Removed hardcoded nodemailer transporter creds from server.js.
- Normalized Cart page layout (100vh, removed giant margins).
- Kept media_queries.css unchanged as requested.

Notes:
- app.js appears to be a separate prototype server; main entry remains server.js (per package.json).
- If app.js is unused in deployment, consider archiving it.
- Further cleanups available upon request (Servis/Kontakt CSS and dead assets).
