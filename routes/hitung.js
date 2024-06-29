const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

// URL koneksi ke MongoDB
const url = 'mongodb://localhost:27017';
const dbName = 'proyek_konstruksi';
const client = new MongoClient(url);

// Middleware untuk memeriksa apakah pengguna telah login
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Rute untuk halaman perhitungan (dengan autentikasi)
router.get('/hitung', isAuthenticated, async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const pekerjaanCollection = db.collection('pekerjaan');
    const pekerjaanList = await pekerjaanCollection.find().toArray();
    res.render('index', { pekerjaanList });
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat memuat halaman perhitungan.');
  }
});

router.post('/hitung', isAuthenticated, async (req, res) => {
  const { pekerjaan, volume } = req.body;

  try {
    await client.connect();
    const db = client.db(dbName);
    const pekerjaanCollection = db.collection('pekerjaan');
    const bahanCollection = db.collection('bahan');

    const pekerjaanData = await pekerjaanCollection.findOne({ nama_pekerjaan: pekerjaan });
    const komponenList = pekerjaanData.komponen;

    let totalHarga = 0;
    let hasilPerhitungan = [];

    for (let komponen of komponenList) {
      const bahanData = await bahanCollection.findOne({ nama_bahan: komponen.nama });
      const biaya = komponen.kebutuhan_per_m3 * volume * bahanData.harga_per_satuan;
      totalHarga += biaya;
      hasilPerhitungan.push({
        nama: komponen.nama,
        kebutuhan: komponen.kebutuhan_per_m3 * volume,
        satuan: komponen.satuan,
        harga: biaya
      });
    }

    res.render('result', { pekerjaan, volume, hasilPerhitungan, totalHarga });
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat menghitung.');
  }
});

module.exports = router;
