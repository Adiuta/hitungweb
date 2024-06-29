const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'proyek_konstruksi';
const client = new MongoClient(url);

// Rute untuk mengatur ulang sandi
router.get('/resetPassword/:token', async (req, res) => {
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

    res.render('resetPassword', { token: req.params.token });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).send('Terjadi kesalahan saat reset password.');
  }
});

router.post('/resetPassword/:token', async (req, res) => {
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
