const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const session = require('express-session');
const indexRouter = require('./routes/index');
const logoutRouter = require('./routes/logout');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const forgotPasswordRouter = require('./routes/forgotPassword');
const resetPasswordRouter = require('./routes/resetPassword');

const app = express();
const port = 3000;

// URL koneksi ke MongoDB
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Nama database
const dbName = 'proyek_konstruksi';

// Konfigurasi Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to false for development, true in production
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user; // Gunakan res.locals bukan req.locals
  next();
});

// Middleware untuk memeriksa apakah pengguna telah login
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.render('login', { title: 'Login' }); // Perbaiki baris ini jika perlu
  }
}

// Gunakan Router
app.use('/', indexRouter);
app.use('/', logoutRouter);
app.use('/', loginRouter);
app.use('/', registerRouter);
app.use('/', forgotPasswordRouter); // Pastikan ini benar
app.use('/', resetPasswordRouter); // Pastikan ini benar

// Menghubungkan ke MongoDB dan menjalankan server
async function connectAndRun() {
  try {
    await client.connect();
    console.log('Terhubung ke MongoDB');

    app.listen(port, () => {
      console.log(`Server berjalan di http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Kesalahan saat menghubungkan ke MongoDB:', error);
  }
}

connectAndRun();
