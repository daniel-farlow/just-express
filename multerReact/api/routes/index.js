var express = require('express');
var router = express.Router();
const fs = require('fs');
const multer  = require('multer')
const upload = multer({ dest: 'public/images/uploads' })

router.post('/uploadFile', upload.single('meme'), function(req, res, next) {
  // rename file with fs module
  // upload path to db
  res.json(req.file);
});

router.post('/uploadFiles', upload.array('meme', 2), function(req, res, next) {
  res.json(req.files);
});

module.exports = router;
