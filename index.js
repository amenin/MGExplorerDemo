/**
 * LinkedDataViz  
 * Client side JavaScript complement of HTML page query form
 * Functions processQuery() decode form and send SPARQL query to node proxy server
 *
 * Yun Tian - Olivier Corby - Marco Winckler - 2019-2020
**/

// switch when uploading to server
//var host_name = "http://localhost"; // local
var host_name = "http://covid19.i3s.unice.fr"
var port = "8080";


// contrôler les rubriques sur la page
// window.onload = function () {
//     var oTab = document.getElementById("tab");
//     var aH3 = oTab.getElementsByTagName("h3");
//     var aDiv = oTab.getElementsByTagName("div");
//     for (var i = 0; i < aH3.length; i++) {
//         aH3[i].index = i;
//         aH3[i].onclick = function () {
//             for (var i = 0; i < aH3.length; i++) {
//                 aH3[i].className = "";
//                 aDiv[i].style.display = "none";
//                 aDiv[this.index].className = "";
//                 aDiv[this.index].className = "content";
//             }
//             this.className = "active";
//             aDiv[this.index].style.display = "block";
//         };
//     }
//     document.getElementById("submit1").click();
// };

function initPage() {
    document.getElementById("viewArea").innerHTML = '';
    document.getElementById("time1").innerHTML = '';
    document.getElementById("time2").innerHTML = '';
    document.getElementById("time3").innerHTML = '';
    document.getElementById("test").innerHTML = '';
    document.getElementById("res1").innerHTML = '';
    document.getElementById("res2").innerHTML = '';
    document.getElementById("res3").innerHTML = '';
}

function setRes(times, mtime) {
    document.getElementById("time1").innerHTML = "SPARQL query: " + times.query_time + "s"
    document.getElementById("time2").innerHTML = "Transformation: " + times.trans_time + "s"
    document.getElementById("time3").innerHTML = "Graphic library: " + mtime + "s";
    document.getElementById("res1").innerHTML = "Number of SPARQL query results: " + times.res_number;
    document.getElementById("res2").innerHTML = "Number of authors (node): " + times.node_number;
    document.getElementById("res3").innerHTML = "Number of copublications relations (edge): " + times.edge_number;
}

// complete SPARQL query with data from HTML form such as year, lab, country
function tune(data) {
    var q = data.query;
    if (data.beginYear != null) {
        q = q.replace(/beginYear/, data.beginYear);
    }
    if (data.endYear != null) {
        q = q.replace(/endYear/, data.endYear);
    }
    if (data.lab != null) {
        q = q.replace(/lab/, data.lab);
    }
    if (data.lab1 != null) {
        q = q.replace(/lab1/, data.lab1);
    }
    if (data.lab2 != null) {
        q = q.replace(/lab2/, data.lab2);
    }
    if (data.country != null) {
        var c = data.country;
        q = q.replace(/countrye/, c.replace(/ /, "_"));
        q = q.replace(/countryf/, getFrenchName(c));
    }
    data.query = q;
}



// Renvoie le nom français d'un pays à partir de son nom anglais
function getFrenchName(country) {
    if (country == "France") return "France";
    if (country == "United Kingdom") return "Royaume-Uni";
    if (country == "United States") return "États-Unis";
    if (country == "Spain") return "Espagne";
    if (country == "Germany") return "Allemagne";
    if (country == "Italy") return "Italie";
    if (country == "Portugal") return "Portugal";
    if (country == "China") return "Chine";
    if (country == "Japan") return "Japon";
    if (country == "Vietnam") return "Vietnam";
    if (country == "Russia") return "Russie";
    if (country == "Brazil") return "Brésil";
    if (country == "Mexico") return "Mexique";
    if (country == "Morocco") return "Maroc";
    return "unknown";
}


function getValue(name, n) {
    return getElement(name, n).value;
}
function getElementIndex(name, n) {
    return document.getElementById(name + n);
}
function getElement(name) {
    return document.getElementById(name);
}


// create JS data from HTML form
function getFormData(form, n) {
    var value = { "type": n };
    var slots = ['uri', 'query', 'format', 'beginYear', 'endYear', 'lab', 'lab1', 'lab2', 'country'];

    for (var i = 0; i < slots.length; i++) {
        var name = slots[i];
        var val = form[name];
        if (val != null) {
            value[name] = val.value;
        }
    }
    return value;
}


// Message in case of failure
function getMessage(values) {
    if (values.type == 2) {
        return "No copublication results found between " + values.lab1 + " and " + values.lab2 + " from " + values.beginYear + " to " + values.endYear + ".";
    }
    else if (values.type == 3) {
        return "No copublication results found between " + values.lab + " and " + values.country + " from " + values.beginYear + " to " + values.endYear + ".";
    }
    return "No copublication results found in " + values.lab + " from " + values.beginYear + " to " + values.endYear + ".";
}


// data is JSON format resulting from transformation, input dor MGExplorer
// graphic display in ./MG-Explorer/MGExplorer/js/MGExplorer.js
function graphicDisplay(data, values) {
    if (values.type == 1) {
        launch(data, values.type, values.lab, "");
    }
    else if (values.type == 2) {
        launch(data, values.type, values.lab1, values.lab2);
    }
    else if (values.type == 3) {
        launch(data, values.type, values.lab, values.country);
    }
}




var sparqldata; // Résultats de la requête SPARQL (en JSON)
var transdata; // Résultats transformés (en JSON)

var test = document.getElementById('test');
var brut = document.getElementById('brut');
var tran = document.getElementById('tran');



/**
 * executed in browser
 * send endpoint URI and SPARQL query to node server.js
 * get JSON result from transformation
 * apply graphic display
**/
function sendRequest2(values) {
    let url = host_name + ":" + port + "/";
    console.log(url);
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(values)
    }).then(response => {
        return response.text;
    }).then(text => {
        console.log("test");
        console.log(text);
        getResult(text);
    }).catch(error => {
        console.log(error)
    });
}


function getResult(text) {
    var result = JSON.parse(text);
    var sparqlResult = result[0];
    sparqldata = JSON.stringify(sparqlResult);
    transdata = JSON.stringify(result[1]);
    var times = result[2];
    var t1 = new Date();
    if (sparqlResult.results.bindings.length > 0) {
        graphicDisplay(transdata, values);
        var t2 = new Date();
        var mtime = parseInt(t2 - t1) / 1000;
        setRes(times, mtime);
    }
    else {
        window.alert(getMessage(values));
    }
}


// send request to node proxy server.js
// request = endpoint uri + sparql query
function sendRequest(values) {
    var v = JSON.stringify(values);
    var xmlHttp = new XMLHttpRequest();

    // when HTTP request resumes, run graphic display 
    xmlHttp.onreadystatechange = function () {

        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            var text = xmlHttp.responseText;
            var result = JSON.parse(text);
            var sparqlResult = result[0];
            sparqldata = JSON.stringify(sparqlResult);
            transdata = JSON.stringify(result[1]);
            var times = result[2];
            var t1 = new Date();

            if (sparqlResult.results.bindings.length > 0) {
                graphicDisplay(transdata, values);
                var t2 = new Date();
                var mtime = parseInt(t2 - t1) / 1000;
                setRes(times, mtime);
            }
            else {
                window.alert(getMessage(values));
            }
        }
    }

    xmlHttp.open('POST', host_name + ":" + port + "/", false);
    // send HTTP request to  node server.js
    // server.js send SPARQL query to SPARQL endpoint and run JSON transformation on query result

    xmlHttp.send(v);
}

function check(values) {
    if (values.endYear < values.beginYear) {
        window.alert("Error : The end year can not be larger than the begin year.");
        return false;
    }
    return true;
}

function selectJson(value) {
    document.getElementById("submit" + value).click();
}

function processQuery(form) {
    processQueryType(form, 1);
}

function processQueryType(form, n) {
    initPage();
    var value = getFormData(form, n);
    tune(value);
    sendRequest(value);
}




function showSparqlResults() {
    var window2 = window.open();
    window2.document.write("<head><title>SPARQL Results</title></head>");
    window2.document.write("<body><p>" + sparqldata + "</p></body>");
    window2.focus();
};

function showTransResults() {
    var window2 = window.open();
    window2.document.write("<head><title>Transformed Results</title></head>");
    window2.document.write("<body><p>" + transdata + "</p></body>");
    window2.focus();
};



























