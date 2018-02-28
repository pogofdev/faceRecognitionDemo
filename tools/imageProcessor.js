const fs = require('fs');
const path = require('path');
const cv = require('opencv4nodejs');
var Finder = require('fs-finder');
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

const getFaceImage = (grayImg) => {
    const faceRects = classifier.detectMultiScale(grayImg).objects;
    if (!faceRects.length) {
        // throw new Error('failed to detect faces');
        console.log('failed to detect faces');
        return null;
    }
    return grayImg.getRegion(faceRects[0]);
};
function extractFace(filePath) {
    if (!cv.xmodules.face) {
        throw new Error('exiting: opencv4nodejs compiled without face module');
    }
    const basePath = './uploads';
    const imgsPath = path.resolve(filePath);

    // find path of all photo files with given name and
    // detect faces in the photo
    // const image = getFaceImage(cv.imreadAsync(filePath).bgrToGrayAsync()).resizeAsync(80,80);
    // cv.imreadAsync(filePath).then(img => img.bgrToGrayAsync().then(getFaceImage));
    console.log(imgsPath);
    const grayImage = cv.imread(imgsPath)
    const faceImage = getFaceImage(grayImage);
    if(faceImage!==null){
        cv.imwrite(imgsPath, faceImage.resize(80,80) );
        console.log(faceImage);
    }
}




// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}


// function to train ai to recognize faces
function startTraining() {
    if (!cv.xmodules.face) {
        throw new Error('exiting: opencv4nodejs compiled without face module');
    }
    const basePath = './uploads';
    const imgsPath = path.resolve(basePath);
    const nameMappings = [];
    var labels = [];

    const imgFiles = fs.readdirSync(imgsPath);

    const images = imgFiles.map(function (fileName) {
        console.log('ten ',fileName.substring(0,fileName.indexOf('_')));
        let name = fileName.substring(0,fileName.indexOf('_'));
        labels.push(name);
        if(name.length>0 && nameMappings.indexOf(name)<0){
            nameMappings.push(name);
        }
        return path.resolve(imgsPath, fileName)
    })
        .map(filePath => cv.imread(filePath))
        .map(img => img.bgrToGray());
    console.log('images length', images.length);
    console.log('name label', labels);
    console.log('nameMapping %s', nameMappings);

    // make labels
    var nameLabels = labels.map(label => nameMappings.findIndex( name => label === name));

    const lbph = new cv.LBPHFaceRecognizer();
    lbph.train(images, nameLabels);
    lbph.save('model_lbph');
    // save nameMap
    var file = fs.createWriteStream('nameMap.txt');
    file.on('error', function(err) { /* error handling */ });
    nameMappings.forEach(function(v) {
        file.write(v + '\n');
    });
    file.end();
}


function startReconizing(filePath) {
    if (!cv.xmodules.face) {
        throw new Error('exiting: opencv4nodejs compiled without face module');
    }
    const lbph = new cv.LBPHFaceRecognizer();
    lbph.load('model_lbph');
    const nameMappings = fs.readFileSync('nameMap.txt').toString().split("\n");
    nameMappings.pop();
    console.log(nameMappings);
    const userImg = cv.imread(filePath);
    const result = classifier.detectMultiScale(userImg.bgrToGray());
    const minDetections = 6;
    result.objects.forEach((faceRect, i) =>{
        // check with the accurate threshold bypass if lower
        if (result.numDetections[i] < minDetections) {
            return;
        }
        const faceImg = userImg.getRegion(faceRect);
        const predictResult = lbph.predict(faceImg.bgrToGray().resize(80,80));
        console.log('Predict confidence ', predictResult.confidence);
        const who = nameMappings[predictResult.label];
        console.log(who);
        if(who){
            // learn
            cv.imwrite('./uploads/' + who + '_' + Date.now() + i + '.jpg', faceImg.resize(80,80) );
        }else{
            console.log('Predict confidence ', predictResult.confidence);
        }
        const rect = cv.drawDetection(userImg,faceRect,{color: new cv.Vec(255,0,0), segmentFraction: 4});

        const alpha = 0.4;
        cv.drawTextBox(userImg,
            new cv.Point(rect.x,rect.y + rect.height + 10),
            [{text: who}], alpha
            )
    })
    cv.imwrite(filePath, userImg );

}
// function extractFace(name,files, dest) {
//     if (!cv.xmodules.face) {
//         throw new Error('exiting: opencv4nodejs compiled without face module');
//     }
//     const basePath = './uploads';
//     const imgsPath = path.resolve(basePath);
//     console.log(imgsPath);
//
//     // find path of all photo files with given name and
//     // detect faces in the photo
//     var filePaths = Finder.from(imgsPath).findFiles(name + '_*.*');
//     console.log('file path count', filePaths.length);
//     // read image
//     const images = filePaths.map(function (filePath) {
//         return cv.imread(filePath)
//     })
//     // face recognizer works with gray scale images
//         .map(function (image) {
//             return image.bgrToGray()
//         })
//         // detect and extract face
//         .map(getFaceImage)
//         .map(function (faceImg) {
//             return faceImg.resize(80, 80)
//         });
//
//
//     for(var i=0;i<images.length;i++){
//         cv.imwrite('./uploads/faces/' + name + '_' + Date.now() + i + '.jpg', images[i] );
//     }
//     console.log(images);
// }

module.exports.extractFace = extractFace;
module.exports.base64_encode = base64_encode;
module.exports.startTraining = startTraining;
module.exports.startReconizing = startReconizing;
