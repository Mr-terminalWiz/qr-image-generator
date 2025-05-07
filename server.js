const express = require('express');
const multer = require('multer');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Folder to store uploaded images
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Set up Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

app.use(express.static('uploads'));
app.use(express.static('public'));

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded!');
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/${req.file.filename}`;

  try {
    const qrDataURL = await QRCode.toDataURL(imageUrl);
    res.json({ qr: qrDataURL });
  } catch (err) {
    res.status(500).send('Error generating QR Code');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
