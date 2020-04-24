var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/images/uploads'});
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/formsub', upload.single('meme'), (req, res, next) => {
  console.log(req.file);
  let {desc: desiredFileName} = req.body; // get what the user named the file on input
  let {originalname: actualFileName} = req.file;
  let newFileName = encodeURIComponent(desiredFileName + Date.now() + actualFileName.slice(actualFileName.lastIndexOf('.')));
  const newPath = `public/images/uploads/${newFileName}`
  fs.rename(req.file.path, newPath, (err) => {
    if (err) throw err;
    // upload newPath to the database
    res.json({msg: 'file uploaded successfully'})
  });
})

router.post('/formsubarray', upload.array('meme'), (req, res, next) => {
  console.log(req.files)
  req.files.forEach( async (file) => {
    let {originalname: actualFileName} = file;
    let newFileName = encodeURIComponent(actualFileName + Date.now() + actualFileName.slice(actualFileName.lastIndexOf('.')));
    const newPath = `public/images/uploads/${newFileName}`
    await fs.rename(file.path, newPath, (err) => {
      if (err) throw err;
      // upload newPath to the database
    });
  })
  res.json({msg: 'files uploaded successfully!'})
})

module.exports = router;
