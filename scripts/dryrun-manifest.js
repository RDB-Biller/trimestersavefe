// Runs before every build. If DRYRUN_TOKEN is set (copy it from the site's install panel in Dry Run), this writes the file Dry Run checks
// to confirm you own the site: /.well-known/dryrun.json. Without the token nothing is written and the app builds exactly as before.
const fs = require('fs'), path = require('path');
const token = (process.env.DRYRUN_TOKEN || '').trim();
const origin = (process.env.DRYRUN_ORIGIN || 'https://dryrun.hnnworld.com').trim().replace(/\/$/, '');
const dir = path.join(__dirname, '..', 'public', '.well-known'), file = path.join(dir, 'dryrun.json');
if (!token) { try { fs.unlinkSync(file); } catch { /* none to remove */ } console.log('Dry Run: DRYRUN_TOKEN not set, no manifest written.'); process.exit(0); }
fs.mkdirSync(dir, { recursive: true });
// A static app has no server add-on, so no capture path; Dry Run previews iterations on the real pages through the page script instead.
fs.writeFileSync(file, JSON.stringify({ dryrun: 1, token, overlay: true, permissions: { structure: false, iterate: true, sampleData: false }, allowedOrigins: [origin] }, null, 2) + '\n');
console.log('Dry Run: wrote public/.well-known/dryrun.json for', origin);
