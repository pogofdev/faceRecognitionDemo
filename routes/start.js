var express = require('express');
var router = express.Router();
const {startTraining} = require('../tools/imageProcessor');

/* GET home page. */
router.get('/', function(req, res, next) {
    startTraining();
    // res.send('starting');
    res.redirect("/whoisit")
    // res.render('whoisit',{filePaths:filePaths});
});

module.exports = router;
