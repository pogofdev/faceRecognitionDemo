const express = require('express');
const app = express();


let myLogger = function (req, res, next) {
    console.log('middleware LOGGED');
    next()
};

// app.use(myLogger);

let router = express.Router();
router.use(function (req,res,next) {
    console.log(req.headers['x-auth']);


   if(req.headers['x-auth']) return next('router');
    next()
});

router.get('/', function (req,res) {
    res.send('next router');
});

app.use('/admin',router,function (req,res) {
    res.sendStatus(401);
});

// app.get('/', (req, res) => res.send('Hello World!'));
// app.get('/train', (req, res) => res.send('Something to train'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));