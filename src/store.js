// Simple JSON-file data store. Swap for a real database in production.
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'db.json');

const defaults = () => ({
  settings: {
    siteName: 'Your Agency',
    tagline: 'Find your next home',
    logoUrl: '',
    primaryColor: '#1f6feb',
    accentColor: '#f59e0b',
    email: 'info@example.com',
    phone: '+00 000 000 000',
    address: '123 Example Street, City',
    currency: '€',
    footerText: 'All rights reserved.'
  },
  users: [{ username: 'admin', password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10) }],
  properties: require('./seed'),
  enquiries: []
});

let db;
function load() {
  if (!fs.existsSync(FILE)) { fs.mkdirSync(DATA_DIR, { recursive: true }); db = defaults(); save(); }
  else db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  return db;
}
function save() { fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); }
const nextId = list => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;

module.exports = { get db() { return db || load(); }, save, nextId };
