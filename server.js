/**
 * LinkedDataViz  
 * Node proxy server
 * Receive query from HTML page, send query to SPARQL endpoint, apply transformation,
 *
 * Yun Tian - Olivier Corby - Marco Winckler - 2019-2020
**/
const port = 8081

const fs = require('fs');
const express = require('express'); 
const bodyParser = require('body-parser');

const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');


const datadir = 'data/';
const datafiletimeout = 86400000;

const cachedir = datadir + 'cache/';
if (!fs.existsSync(cachedir)){
    fs.mkdirSync(cachedir);
}

/**
 * HTTP node server
 * Browser form send HTTP request to this node server
 * Send query to SPARQL endpoint and perform transformation 
 * 
 */
const app = express()

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware
app.use(cors());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(express.static('public'))

// index page 
app.get('/', function (req, res) {
    fs.readdir(datadir, function (err, files) {
        let data = [];

        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            let file_bis = file.split('.');
            if (file_bis[1] != 'json') return;

            let rawdata = fs.readFileSync(datadir + file);
            try {
                data.push({
                    'label': file_bis[0], 
                    'data': JSON.parse(rawdata)
                })
            } catch(e) {
                console.log(file, e); // error in the above string (in this case, yes)!
            }
        });
        console.log(data)
        res.render('index', {data: data});
    });
})

// About page 
app.get('/about', function (req, res) {
    res.render("about");
})

// SPARQL request
app.post('/sparql', function (req, res) {
    // Il s'agit de l'envoi d'une requête SPARQL.
    // Le serveur reçoit la requête en JSON (chaîne de caractères) dont le format est:
    // {"query":  SPARQL Query, "format": graphic display type, "type": query type number}
    var text = '';      // contenu de la requête (objet transformé en string)
    req.on('data', function (str) {
        text = text + str; // get data from HTML page form
    });

    req.on('end', function () {
        const data = JSON.parse(text);
        const mg4 = require("./trans_mg4");

        let cachefilename = cachedir + data.id + '.json';
        let result;
        try {
            if (data.id && fs.existsSync(cachefilename)) { // Check if cache exists for request
                const stats = fs.statSync(cachefilename);
                if ((new Date().getTime() - stats.mtimeMs) < datafiletimeout) {
                    // Data cache file is recent => load cache
                    result = fs.readFileSync(cachefilename);
                }
            }
        } catch (e) {
            // send error back to client
            res.writeHeader(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
            res.write(e, "utf-8");
        }
        try {
            if (result == undefined) {
                // No cache file or file too old
                // send query to SPARQL endpoint, perform JSON transformation, generate graphic display
                result = mg4.transform(data);
                result = JSON.stringify(result);
                if (data.id) {
                    // Save request result in cache (for published queries only - query with id)
                    fs.writeFile(cachefilename, result, function (err) {
                        if (err) {
                            console.log("Error while writing file " + cachefilename + " - " + err);
                        }
                    });
                }
            }
            // send result back to client: HTML + JS graphic specification
            res.writeHeader(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.write(result, "utf-8");
        } catch (e) {
            console.log("SPARQL request error - " + e);
            // send error back to client
            res.writeHeader(400, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
            res.write(e, "utf-8");
        }
        res.end();
    });
})

app.post('/upload', function(req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let dataFile = req.files.dataFile;

    let saveFile = JSON.parse(req.body.fileProps).saveFile;
    // Use the mv() method to place the file somewhere on your server
    if (saveFile) {
        dataFile.mv(datadir + dataFile.name, function(err) {
        if (err)
            return res.status(500).send(err);
        });
    }   
    res.send(dataFile.data);
});

// Clear the cache of a query (not used for now)
app.post('/clearcache', function (req, res) {
    var data = req.body;

    var cachefilename = datadir + data.id + '.json';

    let json = {};
    if (fs.existsSync(cachefilename)) {
        fs.unlink(cachefilename, function (err) {
            if (err) {
                console.log("Error while deleting file " + cachefilename + " - " + err);
                res.sendStatus(500);
            } else {
                res.sendStatus(200);
            }
        });
    }
})

app.listen(port, () => console.log(`Server started at port ${port}.`))
