// SERVER LIBRARIES
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');

// MULTER LIBRARIE & CONFIG
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({storage});

// ASCII LIBRARIES
const asciify = require('asciify-image');
const ansi = require('ansi-to-html');
const convert = new ansi();

// SERVER CONFIG
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/public')));

app.get('/', (req, res) => {
    res.render('index', { ascii: '', err: ''});
});

app.post('/', upload.single('image'), (req, res) => {
    let imagePath = req.file.path;
    let size = { width: Number(req.body.width), height: Number(req.body.height) }
    let asciiOptions = { fit: 'box', width: size.width, height: size.height, color: false };

    asciify(imagePath, asciiOptions)
        .then((asciified) => {
            let asciiToHtml = convert.toHtml(asciified);
            res.render('index', { ascii: asciiToHtml, err: '' });
        })
        .catch((err) => res.render('index', { ascii: '', err }))
        .finally(() => {
            fs.unlink(imagePath, () => {
                console.log('Image Deleted!');
            })
        });
});

app.get('*', (req, res) => res.render('index', { ascii: '', err: ''}));

app.listen(port, () => {
    console.log(`Listening to http://localhost:${port}`);
});