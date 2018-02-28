var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');

const {startReconizing, base64_encode} = require('../tools/imageProcessor');

// configure upload files
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './userUploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var upload = multer({ storage : storage }).array('userPhoto');

/* GET users listing. */
router.get('/', function(req, res, next) {
    // res.send('respond with a resource');
    res.render('whoisitform', { title: 'Upload photo'});
});
router.post('/', function(req, res, next) {
    upload(req,res,function(err) {
        // console.log(req.body);
        // console.log(req.files);

        if(err) {
            return res.end("Error uploading file." + err.stack);
        }
        var filePaths = [];
        // rename the file
        for(var i = 0; i < req.files.length;i++){
            var fileObj = {
                "image/png": ".png",
                "image/jpeg": ".jpeg",
                "image/jpg": ".jpg"
            };
             var newFilePath = './userUploads/' + req.files[i].originalname;
            // fs.renameSync('./uploads/'+req.files[i].originalname, newFilePath);
            // extractFace(newFilePath);
             startReconizing(newFilePath);
             filePaths.push({base64Img:base64_encode(newFilePath), fileName:req.files[i].originalname});
        }

        // res.end("File is uploaded");
        res.render('result1',{filePaths:filePaths});
    });
    // res.send('your name is ' + req.body.name_field);

});
// router.post('/',[check('name_email','must be an email').isEmail(),check('name_field', 'length must larger than 500').isLength({min:500})], function(req, res, next) {
//     // Get the validation result whenever you want; see the Validation Result API for all options!
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(errors.mapped());
//         res.render('train',{errors:errors.mapped()})
//     }else {
//         res.send('your name is ' + req.body.name_field);
//     }
//     // res.render('train', { title: 'Train your bot'});
// });

module.exports = router;
