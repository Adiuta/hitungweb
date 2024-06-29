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

// Define a GET route for /register to render the register form
router.get('/register', (req, res) => {
  res.render('register',{title: 'Register'}); // Assuming you are using a templating engine like EJS
});

// Rute untuk halaman register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.connect();
    const db = client.db(dbName);
    const userCollection = db.collection('users');

    const existingUser = await userCollection.findOne({ email }); // Check existing user by email

    if (existingUser) {
      res.redirect('/register',{title:'Register'});
    } else {
      await userCollection.insertOne({ name, email, password: hashedPassword });
      // Redirect to login with a success message
      res.redirect('/login?success=true');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat register.');
  }
});


module.exports = router;
