const multer = require('multer');
const { uuid } = require('uuidv4');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + uuid() + '.' + file.mimetype.split('/')[1]);
  },
});

// module.exports = multer({ dest: 'public/images' });
module.exports = multer({ storage });
