const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// URL koneksi ke MongoDB
const url = 'mongodb://localhost:27017';
const dbName = 'proyek_konstruksi';
const client = new MongoClient(url);

// Rute untuk halaman login
router.get('/login', (req, res) => {
  res.render('login', {title: 'Login'});
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    await client.connect();
    const db = client.db(dbName);
    const userCollection = db.collection('users');

    const normalizedEmail = email ? email.toLowerCase() : '';
    const user = await userCollection.findOne({ email: normalizedEmail });

    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.user = user; // Store the user object in the session
        res.render('index', { title: 'Home', user: user });
      } else {
        res.render('login', { title: 'Login' });
      }
    } else {
      res.render('login', { title: 'Login' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Terjadi kesalahan saat login.');
  }
});

// Rute untuk lupa sandi
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', {title: 'Forgot Password'});
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    await client.connect();
    const db = client.db(dbName);
    const userCollection = db.collection('users');

    const normalizedEmail = email ? email.toLowerCase() : '';
    const user = await userCollection.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const token = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000; // 1 jam

    await userCollection.updateOne(
      { email: normalizedEmail },
      { $set: { resetPasswordToken: token, resetPasswordExpires: resetPasswordExpires } }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    const mailOptions = {
      to: user.email,
      from: 'passwordreset@demo.com',
      subject: 'Password Reset',
      text: `Please click on the following link, or paste it into your browser to complete the process: http://${req.headers.host}/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error('There was an error: ', err);
      } else {
        res.status(200).send('Recovery email sent');
      }
    });
  } catch (error) {
    console.error('Error during password reset request:', error);
    res.status(500).send('Terjadi kesalahan saat meminta reset password.');
  }
});

// Rute untuk reset sandi
router.get('/reset-password/:token', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const userCollection = db.collection('users');

    const user = await userCollection.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send('Password reset token is invalid or has expired.');
    }

    res.render('reset-password', { token: req.params.token });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).send('Terjadi kesalahan saat reset password.');
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const userCollection = db.collection('users');

    const user = await userCollection.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send('Password reset token is invalid or has expired.');
    }

    if (req.body.password === req.body.confirmPassword) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await userCollection.updateOne(
        { email: user.email },
        { $set: { password: hashedPassword, resetPasswordToken: undefined, resetPasswordExpires: undefined } }
      );
      res.status(200).send('Password has been reset');
    } else {
      res.status(400).send('Passwords do not match');
    }
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).send('Terjadi kesalahan saat reset password.');
  }
});

module.exports = router;
