const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const store = require('./store');

const app = express();
const UPLOADS = path.join(__dirname, '..', 'public', 'uploads');
const upload = multer({ dest: UPLOADS, limits: { fileSize: 5 * 1024 * 1024 } });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET || 'change-me', resave: false, saveUninitialized: false }));
app.use((req, res, next) => {
  res.locals.s = store.db.settings;
  res.locals.user = req.session.user;
  res.locals.fmt = n => store.db.settings.currency + Number(n).toLocaleString();
  next();
});

// ---------- Public site ----------
app.get('/', (req, res) => {
  const props = store.db.properties;
  res.render('home', { featured: props.filter(p => p.featured), cities: [...new Set(props.map(p => p.city))] });
});

app.get('/properties', (req, res) => {
  const q = req.query;
  let list = store.db.properties.filter(p =>
    (!q.status || p.status === q.status) &&
    (!q.type || p.type === q.type) &&
    (!q.city || p.city === q.city) &&
    (!q.minPrice || p.price >= +q.minPrice) &&
    (!q.maxPrice || p.price <= +q.maxPrice) &&
    (!q.beds || p.bedrooms >= +q.beds) &&
    (!q.keyword || (p.title + p.description).toLowerCase().includes(q.keyword.toLowerCase())));
  if (q.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
  else if (q.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const all = store.db.properties;
  res.render('list', { list, q, cities: [...new Set(all.map(p => p.city))], types: [...new Set(all.map(p => p.type))] });
});

app.get('/properties/:id', (req, res) => {
  const p = store.db.properties.find(x => x.id === +req.params.id);
  if (!p) return res.status(404).render('message', { title: 'Not found', msg: 'Property not found.' });
  res.render('detail', { p, sent: req.query.sent });
});

app.post('/enquiry', (req, res) => {
  const { name, email, phone, message, propertyId } = req.body;
  if (!name || !email) return res.status(400).render('message', { title: 'Error', msg: 'Name and email are required.' });
  store.db.enquiries.push({ id: store.nextId(store.db.enquiries), name, email, phone, message, propertyId: propertyId ? +propertyId : null, createdAt: new Date().toISOString() });
  store.save();
  res.redirect(propertyId ? `/properties/${propertyId}?sent=1` : '/contact?sent=1');
});

app.get('/contact', (req, res) => res.render('contact', { sent: req.query.sent }));

// ---------- Admin ----------
const auth = (req, res, next) => req.session.user ? next() : res.redirect('/admin/login');

app.get('/admin/login', (req, res) => res.render('admin/login', { error: null }));
app.post('/admin/login', (req, res) => {
  const u = store.db.users.find(x => x.username === req.body.username);
  if (!u || !bcrypt.compareSync(req.body.password || '', u.password)) return res.render('admin/login', { error: 'Invalid credentials' });
  req.session.user = u.username;
  res.redirect('/admin');
});
app.post('/admin/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

app.get('/admin', auth, (req, res) => res.render('admin/dashboard', { props: store.db.properties, enquiries: store.db.enquiries }));

app.get('/admin/properties/new', auth, (req, res) => res.render('admin/form', { p: {} }));
app.get('/admin/properties/:id/edit', auth, (req, res) => res.render('admin/form', { p: store.db.properties.find(x => x.id === +req.params.id) || {} }));

function fromBody(b, files, existing = {}) {
  const urls = (b.imageUrls || '').split('\n').map(s => s.trim()).filter(Boolean);
  return {
    ...existing, title: b.title, type: b.type, status: b.status, price: +b.price || 0, city: b.city,
    bedrooms: +b.bedrooms || 0, bathrooms: +b.bathrooms || 0, area: +b.area || 0,
    featured: !!b.featured, description: b.description,
    images: [...urls, ...(files || []).map(f => '/uploads/' + f.filename)]
  };
}
app.post('/admin/properties', auth, upload.array('images', 10), (req, res) => {
  store.db.properties.push({ id: store.nextId(store.db.properties), createdAt: new Date().toISOString().slice(0, 10), ...fromBody(req.body, req.files) });
  store.save(); res.redirect('/admin');
});
app.post('/admin/properties/:id', auth, upload.array('images', 10), (req, res) => {
  const i = store.db.properties.findIndex(x => x.id === +req.params.id);
  if (i >= 0) { store.db.properties[i] = fromBody(req.body, req.files, store.db.properties[i]); store.save(); }
  res.redirect('/admin');
});
app.post('/admin/properties/:id/delete', auth, (req, res) => {
  store.db.properties = store.db.properties.filter(x => x.id !== +req.params.id); store.save(); res.redirect('/admin');
});
app.post('/admin/enquiries/:id/delete', auth, (req, res) => {
  store.db.enquiries = store.db.enquiries.filter(x => x.id !== +req.params.id); store.save(); res.redirect('/admin');
});

app.get('/admin/settings', auth, (req, res) => res.render('admin/settings', { saved: req.query.saved }));
app.post('/admin/settings', auth, upload.single('logo'), (req, res) => {
  const s = store.db.settings;
  for (const k of Object.keys(s)) if (k in req.body) s[k] = req.body[k];
  if (req.file) s.logoUrl = '/uploads/' + req.file.filename;
  if (req.body.newPassword) store.db.users.find(u => u.username === req.session.user).password = bcrypt.hashSync(req.body.newPassword, 10);
  store.save(); res.redirect('/admin/settings?saved=1');
});

const PORT = process.env.PORT || 3000;
store.db;
app.listen(PORT, () => console.log(`propertiesCMS running on http://localhost:${PORT}`));
