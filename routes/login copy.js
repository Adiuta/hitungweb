const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
// const { MongoClient, ServerApiVersion } = require('mongodb');

// URL koneksi ke MongoDB
// const uri = "mongodb+srv://gdadiputra2:qv4ivJvITCH4UpiR@hitungapp.cjjacz1.mongodb.net/?retryWrites=true&w=majority&appName=hitungapp";
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
const url = 'mongodb://localhost:27017';
const dbName = 'proyek_konstruksi';
const client = new MongoClient(url);

// Rute untuk halaman login
router.get('/login', (req, res) => {
  res.render('login', {title: 'Login'});
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email, password); // Tambahkan log ini untuk debugging

  try {
    await client.connect();
    const db = client.db(dbName);
    const userCollection = db.collection('users');

    // Convert email to lowercase before querying
    const normalizedEmail = email ? email.toLowerCase() : '';
    const user = await userCollection.findOne({ email: normalizedEmail });

    if (user) {
      console.log('User found:', user);
      if (await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.user = user; // Store the user object in the session
        res.render('index', { title: 'Home', user: user });
      } else {
        console.log('Password mismatch');
        res.render('login', { title: 'Login' });
      }
    } else {
      console.log('No user found with that email:', normalizedEmail);
      res.render('login', { title: 'Login' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Terjadi kesalahan saat login.');
  }
});

module.exports = router;
