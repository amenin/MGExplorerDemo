/**
 * LinkedDataViz Transformation 
 * Server Side
 * Transform SPARQL Result JSON Format to MGExplorer JSON Format
 *
 * Yun Tian - Olivier Corby - Marco Winckler - 2019-2020
**/

// Default types in HAL Query: Conference Paper, Report, Book, Article
// which will be (however) showed as : Publication, Journal, Book, Proceeding
//  const fetch = require("./node_modules/node-fetch");

const types = [
    "https://data.archives-ouvertes.fr/doctype/ConferencePaper",
    "https://data.archives-ouvertes.fr/doctype/Report",
    "https://data.archives-ouvertes.fr/doctype/Book",
    "https://data.archives-ouvertes.fr/doctype/Article"
];

const defaultType = "https://data.archives-ouvertes.fr/doctype/ConferencePaper";

const undef = "undef";
const skip  = "skip";
const mix   = "mix";

// "Qt Publications", "Qt Journals", "Qt Books", "Qt Proceedings",

    
// Transformer l'uri de type vers une chaîne de caractère simple
function transformType(typeuri) {
    if (typeuri == types[0]) return "conference paper";
    if (typeuri == types[1]) return "report";
    if (typeuri == types[2]) return "preprint";
    return "article";
}

const name1 = "n1";
const name2 = "n2";
const type  = "type";
const doc   = "doc";

const languages = [
    "en", "pt", "es", "de", "fr"
];

// demander la longueur d'un set
// set : Javascript Set
// $return : la longueur du Set (integer)
function getLen(set) {
    var l = 0;
    for (var x of set) {
        l++;
    }
    return l;
}

// demander une valeur dans le résultat SPARQL
// data : résultat SPARQL
// i : indice de data (number, integer)
// name : nom de la variable (n1, n2, doc, title, ...)
function getValue(data, i, name) {
    if (name in data[i]) {
        return data[i][name].value;
    } else {
        return " ";
    }
}

// prendre le nom complète d'un auteur et donner son nom abbrégé (par ex. getShortName("Yun Tian") = "Y. Tian" )
// à optimiser : getShortName("Catherine Faron Zucker") donne "C. Zucker" mais "C. Faron Zucker" est attendu
function getShortName(fullname) {
    var words = fullname.split(" ");
    var firstname = words[0];
    var lastname = words[words.length - 1];
    var shortname = firstname[0] + ". " + lastname;
    //return shortname;
    return shortname;
}



// Calculer la quantité totale de publications d'un auteur ou de copublications entre deux auteurs
// qtEachType : vecteur à longueur 4 (Array of number, integer)
// $return : la somme des chiffres dans l'Array (number, integer)
function findQtPub(qtEachType) {
    var sum = 0;
    for (var i = 0; i < qtEachType.length; i++) {
        sum = sum + Number(qtEachType[i]);
    }
    return sum;
}



// map:  type -> index of type in typecount = createTypeIndex(types)
// typecount: array of counter for each document type
function findQtTypeCo(data, authorname, coauthorname, typecount, map) {
    var index = data.findIndex(function (ele) {
        if (ele.n1.value == authorname && ele.n2.value == coauthorname) {
            var ind = map.get(ele.type.value);
            typecount[ind] = typecount[ind] + 1;
        }
                
        if (ele.test != null && ele.test.value == "true") {
            if (ele.n2.value == authorname && ele.n1.value == coauthorname) {
                var ind = map.get(ele.type.value);
                typecount[ind] = typecount[ind] + 1;
            }
        }
    });
    return typecount;
}

// Trouver la quantité de copublications en certaine langue entre deux auteurs
// data : résultat SPARQL
// authorname : nom complet de l'auteur (string)
// coauthorname : nom complet du coauteur (string)
// languageName : nom de la langue (string)
// $return : la quantité de copublications en certaine langue entre deux auteurs (number, integer)
function findQtOneLanCo(data, authorname, coauthorname, languageName) {
    var s = 0;
    var index = data.findIndex(function (ele) {
        var na = ele.n1.value;
        var nc = ele.n2.value;
        var la = ele.lan.value;
        if (na == authorname && nc == coauthorname && la == languageName) {
            s++;
        }
    });
    return s;
}


// Trouver le nom complet d'un auteur à partir de son id dans nodes
// nodes : objet créé pendant la transformation
// i : l'id de l'auteur (number, integer)
// $return : nom complet de l'auteur (string)
function getNameById(nodes, i) {
    return nodes.dataNodes[i].labels[1];
}



// Transformer le format spéciale d'une date vers l'année en 4 chiffres ($return string)
function transformDate(dateuri) {
    dateuri = String(dateuri);
    dateuri = dateuri.replace('\"', "");
    return dateuri.substr(0, 4);
}

function isInclude(arr, ele) {
    for (var i=0; i<arr.length; i++) {
        var same = similar(ele.authorID, ele.coauthorID, arr[i].authorID, arr[i].coauthorID);
        if (same) {
            return true;
        }
    }
    return false;
}

function similar(i1, i2, j1, j2) {
    return (i1 == j1 && i2 == j2) || (i1 == j2 && i2 == j1);
}

// Fonction développée pour visualiser les données demandées par la technique "Papers' List"
// data : résultat SPARQL
// nodes : objet créé pendant la transformation
// $return : un Array dont chaque élément (objet) représente un document avec toutes ses informations

function myFindDocumentInformation(data, nodes, idMap) {
    var docMap = new Map();
    
    for (var i = 0; i < data.length; i++) {
        var elem = data[i];
        var dc = elem.doc.value;  
        
        if (! docMap.has(dc)) {
            var tp = transformType(elem.type.value);
            var dt = transformDate(elem.date.value);
            var tt = elem.title.value;
            var authors = [];
            var desc = {"type": tp, "date": dt, "title": tt, "authors": authors, "link": dc};
            if (elem.authorList != null) {
                desc.authorList = elem.authorList.value;
            }
            docMap.set(dc, desc);
        }
        
        var docu = docMap.get(dc);
        var aut  = docu.authors;
        
        var n1 = elem.n1.value;
        var n2 = elem.n2.value;
        var i1 = idMap.get(n1);
        var i2 = idMap.get(n2);
        
        if (!aut.includes(i1)) aut.push(i1);
        if (!aut.includes(i2)) aut.push(i2);
        docu.authors = aut;
    }
    
    var allDocs = []; 
    // console.log("doc size " + docMap.size);
    for (let dd of docMap.values()) {
        allDocs.push(dd);
    }

    return allDocs;
}


// docInfo : Array créé par la fonction findDocumentInformation
// nodes : Array créé pendant la transformation
// authorId : l'id de l'auteur dans nodes
// coauthorId : l'id du coauteur dans nodes
// $return : les documents que les 2 auteurs ont copubliés (sous-ensemble de docInfo)
function findCoDoc(docInfo, nodes, authorId, coauthorId) {
    var l = docInfo.length;
    var docArray = [];
    for (var i = 0; i < l; i++) {
        var doc = docInfo[i];
        var dc = doc.link;
        if (doc.authors.includes(authorId) &&
            doc.authors.includes(coauthorId)
        ) docArray.push(doc);
    }
    return docArray;
}

// Filtrer les résultats SPARQL dont le type du document ne correspond pas aux 4 types choisis
function deleteIrrelevantTypes(data) {
    data = data.filter(function (item) {
        complete(item);
        var tp = item.type.value;
        var bb = types.includes(tp);
        
        //var n1 = item.n1.value;
        //var n2 = item.n2.value;
        // console.log('item', item)
        var ok = item.author != null || 
            (item.n1 && item.n2 && item.n1.value != "" && item.n2.value != "");
        
        return ok && bb;
    });
    return data;
}

function complete(item) {
    if (item.type == null) {
        item.type = {"value": defaultType};
    }
    if (item.lan == null) {
        item.lan = {"value": "en"};
    }
    if (item.date == null) {
        item.date = {"value": "2020-01-01"};        
    }
    if (item.title == null) {
        item.title = {"value": "Undefined"};        
    }
}

// add a2 in a1 coauthor set
function addCoauthor(map, a1, a2) {
    if (! map.has(a1)) {
        map.set(a1, new Set());
    }
    var aset = map.get(a1);
    aset.add(a2);
}

/**
 * sparql result elem may contain styles for nodes with variable ?style and ?mix
 * styleMap :  author -> style
 * variable ?mix when it exists is the style to assign to a node having two different styles
 */
function defStyle(stylesheet, styleMap, a1, a2, elem) {
    var mix = undef;
    if (elem.mix != null) {
        mix = elem.mix.value;
    }
    
    if (elem.style1 != null) {
        addStyle(stylesheet, styleMap, a1, elem.style1.value, mix);    
    }
    if (elem.style2 != null) {
        addStyle(stylesheet, styleMap, a2, elem.style2.value, mix);    
    }
    if (elem.style != null) {
        addStyle(stylesheet, styleMap, a1, elem.style.value, mix);    
        addStyle(stylesheet, styleMap, a2, elem.style.value, mix);    
    } 
}

/**
 * name is either the name of a style in the stylesheet of the name of a color
 */
function getStyle(stylesheet, name) {
    if (stylesheet.node != null && stylesheet.node[name] != null) {
        // style name
        var elem = stylesheet.node[name];
        if (elem.color != null) {
            return elem.color;
        }
    }
    // color name
    return name;
} 

/**
 * Assign a style to author node in the style map
 * mixvar is a backup style in case node already has a style, comes from ?mix variable
 */
function addStyle(stylesheet, map, node, style, mixvar) {
    if (style == skip) {
        // do nothing yet, style may be set by another result
    }
    else if (map.has(node)) {
        // node already has style
        var val = map.get(node);
        if (val != style) {
            // different styles for same node
            if (mixvar != undef) {
                // set mix style from ?mix variable
                map.set(node, mixvar);
            }
            else if (stylesheet.node != null && stylesheet.node.mix != null ) {
                // set mix style from stylesheet
                getMixValue(stylesheet, map, node, val, style);
            }
        }
    }
    else {
        map.set(node, style);
    }
}



/**
 * value: current value 
 * style: new value
 */ 
function getMixValue(stylesheet, map, node, value, style) {
    if (stylesheet.node[value] != null && stylesheet.node[value].priority != null &&
        stylesheet.node[style] != null && stylesheet.node[style].priority != null) {
        if (stylesheet.node[value].priority < stylesheet.node[style].priority) {
            // prefer old style
        }
        else {
            // prefer new style 
            map.set(node, style);
        }
    }
    else {
        // mix is the name of the mix style
        map.set(node, mix);
    }
}




/**
 * Style eventually assigned to mgexplorer author node data structure
 * When there is a stylesheet with default style, return default color
 */
function getFinalStyle(stylesheet, map, node) {
    if (map.has(node)) {
        return getStyle(stylesheet, map.get(node));
    }
    if (stylesheet.node != null && stylesheet.node.default != null && stylesheet.node.default.color != null) {
        return stylesheet.node.default.color;
    }
    return undef;
}

function theStyle(stylesheet, name) {
    // color name such as "green" :
    return name;
}

/**
* i = index of type in array of types
* increment the counter of documents of type i for author a
* docMap:  author -> Set of doc
* typeMap: author -> array of number of documents by type
**/
function addType(docMap, typeMap, a, doc,   i) {
    if (! docMap.has(a)) {
        docMap.set(a, new Set());
    }
    var docSet = docMap.get(a);
    if (! docSet.has(doc)) {
        docSet.add(doc);
        if (! typeMap.has(a)) {
            var arr = createTypeCounterArray(types);
            typeMap.set(a, arr);
        }
        var at = typeMap.get(a);
        at[i] = at[i] + 1;
    }
}

// create an array of number of documents by type
function createTypeCounterArray(types) {
    var arr = [];
    arr.length = types.length;
    for (j=0; j<arr.length; j++) {
        arr[j] = 0;
    }
    return arr;
}


// document type -> index of doc type
function createTypeIndex(types) {
    var map = new Map();
    for (j = 0; j<types.length; j++) {
        map.set(types[j], j);
    }
    return map;
}

// uri:    sparql endpoint URI 
// query:  sparql query
function sparqlQuery2(query, uri) {
//   console.log(uri);
  var url = uri + "?query=" + prepare(query);
  url     = url + "&format=application%2Fsparql-results%2Bjson";
  fetch(url, {
    method:'POST'
  }).then(response => {
     return response.text();
  }).then(text => {
     return text;
  }).catch(error => {
    console.log(error)
  });
}

function prepare(query) {
    query = encodeURIComponent(query);
    query = query.replace(/\%20/g, "+");
    query = query.replace(/\(/g, "%28");
    query = query.replace(/\)/g, "%29");
    return query;
}

function sparqlQuery(query, uri) {
    query = prepare(query);

    // Configurer la requête SPARQL en format http
    //var httpquery = "https://data.archives-ouvertes.fr/sparql?default-graph-uri=&query=";
    //var httpquery = uri + "?default-graph-uri=&query=";
    var httpquery = uri + "?query=";
    httpquery = httpquery + query;
    //httpquery = httpquery + "&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+";
    // Accept application/sparql-results+json must be specified with format parameter for Virtuoso:
    // format=application/sparql-results+json
    httpquery = httpquery + "&format=application%2Fsparql-results%2Bjson";

    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttpquery = new XMLHttpRequest();
    xmlhttpquery.open("POST", httpquery, false);
    //xmlhttpquery.setRequestHeader("Accept", "application/sparql-results+json");
    xmlhttpquery.send();
    return xmlhttpquery.responseText;
}


/** 
 * data = SPARQL query  result bindings in JSON format
 * if there is a author variable with the list of authors,
 * split this list into pairs of n1, n2 and complete the bindings with 
 * these fake results in such a way to be compliant with the transformation
 * 
 */
function prepareResult(data) {
    if (data.length > 0 && data[0].author != null) {
        // author = a--b--c
        return split(data);
    }
    else {
        // n1 = a, n2 = b
        return data;
    }
}

// process each result
function split(data) {
    var res = [];
    for (var i = 0; i<data.length; i++) {
        push(data[i], res);
    }
    return res;
}

/**
 * Rewrite one result 
 * {author = "a ; b ; c"}
 * as several results 
 * {n1 = a, n2 = b} {n1 = a, n2 = c} {n1 = b, n2 = c}
 * 
 **/
function push(elem, res) {
    var authorList = elem.author.value.split("--");
    if (authorList.length > 1) {
        for (var i = 0; i<authorList.length; i++) {
            for (var j = i+1; j<authorList.length; j++) {
                var obj = copy(elem);
                obj.n1 = {"type": "literal", "value": authorList[i]};
                obj.n2 = {"type": "literal", "value": authorList[j]};
                if (elem.style != null) {
                    obj.style = elem.style;
                }
                res.push(obj)
            }
        }
    }
    return res;
}

function copy(elem) {
    var obj = elem.constructor();
    for (var attr in elem) {
        if (elem.hasOwnProperty(attr)) obj[attr] = elem[attr];
    }
    return obj;
}


/** 
 * Main Fonction  
 * input: whole JSON received by server (contains SPARQL query, type and endpoint)
 * send query to SPARQL endpoint
 * process JSON Transformation
**/
function transform(input) {
    var q_type = input.type;
    var query = input.query;
    var uri = input.uri;
    var stylesheet = {};
    if (input.stylesheet != null) {
        stylesheet = input.stylesheet;
    }
    
    if (stylesheet.appli != null) {
        console.log("appli: ", stylesheet.appli.name);
    }
    var ti1 = new Date();
    // console.log("query uri: ", uri);
    // console.log(query);
    var text = sparqlQuery(query, uri);
    var res1 = ""
    try {
        res1 = JSON.parse(text); // Résultat brut de la requête SPARQL
    } catch (e) {
        let updatedtext = text;
        if (updatedtext.startsWith('Virtuoso')) {
            // SPARQL server result is not JSON => syntax error message
            // Update error message to add line numbers
            var tab = text.split('\n');
            updatedtext = tab[0] + '\n' + tab[1] + '\n' + tab[2] + '\n';
            for (var i = 3; i < tab.length - 1; i++) {
                updatedtext = updatedtext + (i - 2) + '.\t' + tab[i] + '\n';
            }
        }
        throw updatedtext; // SPARQL syntax error
    }
    
    // Transformation
    
    var data = res1.results.bindings; 
    // console.log("result: ", data.length);
    data = deleteIrrelevantTypes(data); // Remove data with undefined document type
    data = prepareResult(data);
    var ti2 = new Date();
    //console.log(JSON.stringify(data));
    var len = data.length;

    var numNodes, numEdges;

    // Créer le corps de l'objet json par rapport au format attendu par MG-Explorer
    // Les données seront remplies dans "dataNodes" et "dataEdges"
    var nodes = nodeFormat();
    var edges = edgeFormat();

    var not = "Not Informed"; // Remplir aux termes non-obligatoires
    var typeIndex = createTypeIndex(types);
    // author -> style (graph node color style)
    var styleMap = new Map();
    // set of all authors
    var authorSet = new Set();
    // author -> Set(coauthor)
    var authorMap = new Map();
    // author -> Set(document)
    var docMap = new Map();
    // author -> [nb doc type_i]
    var docTypeMap    = new Map();
    
    // for each solution
    for (var i = 0; i < len; i++) {
        var elem = data[i];
        
        var a1   = getValue(data, i, name1);
        var a2   = getValue(data, i, name2);
        var type = getValue(data, i, "type");
        var doc  = getValue(data, i, "doc");

        
        authorSet.add(a1);
        authorSet.add(a2);
        
        // coauthor set
        addCoauthor(authorMap, a1, a2);
        addCoauthor(authorMap, a2, a1);
        // count doc by type of doc
        addType(docMap, docTypeMap, a1, doc, typeIndex.get(type));
        //if (q_type == 1) 
        addType(docMap, docTypeMap, a2, doc, typeIndex.get(type));
        
        if (q_type == 1) {
            // other query types define their own style
            defStyle(stylesheet, styleMap, a1, a2, elem)
        }
    }
    
    //console.log(authorSet);
    // console.log("author size:", authorSet.size);
    var id = 0;
    
    // name -> ID
    var idMap = new Map();
         
    // generate node data structure
    for (var author of authorSet) {
        var shortName = getShortName(author);
        var coauthorSet = authorMap.get(author);
        var qtCoauthor = coauthorSet.size;            
        var qtEachType = docTypeMap.get(author);
        
        //console.log(author);
        //console.log(coauthorSet);
        //console.log(qtEachType);
        
        // lb is a style info to specify graph node color in MG-Explorer/nodeEdge/js/nodeEdgeChart.js
        var lb = 1;
        var style = undef;
        
        if (q_type == 1) {
            style = getFinalStyle(stylesheet, styleMap, author);
            if (input.style != null && !input.style) {
                style = undef;
            }      
        }
        else {
            lb = getLB(data, author);
        }
        
        if (coauthorSet.size != 0) {
            idMap.set(author, id);
            var nodeInfo = getNodeInfo(id, shortName, author, qtEachType, qtCoauthor, style, lb);
            nodes.dataNodes.push(nodeInfo);
            id++;
        }
    }
    
    numNodes = id;

    // array of documents: title, uri, authors id array
    var docInfo = myFindDocumentInformation(data, nodes, idMap); //  documents

    var groupList = []; // contiendra les paires [author, coauthor]
    
    for (var i = 0; i < len; i++) {
        var author     = getValue(data, i, name1);
        var coauthor   = getValue(data, i, name2);
        var authorID   = idMap.get(author);
        var coauthorID = idMap.get(coauthor);
        var obj = {"authorID": authorID, "coauthorID": coauthorID};
        
        if (coauthorID != -1 && coauthorID < numNodes && !isInclude(groupList, obj)) {
            groupList.push(obj);
        }
    }    
    
    numEdges = groupList.length;
    
    // generate edge data structure
    // for each pair of coauthors:
    for (var i = 0; i < numEdges; i++) { 
        var id1 = groupList[i].authorID;
        var id2 = groupList[i].coauthorID;
        var n1 = getNameById(nodes, id1);
        var n2 = getNameById(nodes, id2);
        
        var qtEachTypeCo = [];
        var qtEachLanCo = createTypeCounterArray(languages); // []
        
        var docTypeCounter = createTypeCounterArray(types);
        // nb doc by type
        findQtTypeCo(data, n1, n2, docTypeCounter, typeIndex);
        
        // nb doc by type
        qtEachTypeCo = docTypeCounter;
        
        // TODO: doc by language ?
        //for (var j = 0; j < languages.length; j++) {
        //    qtEachLanCo.push(findQtOneLanCo(data, n1, n2, languages[j]));
        //}
        
        // sum of nb doc
        var qtPubCo   = findQtPub(qtEachTypeCo);
        // array of documents published by coauthors in any order
        var documents = findCoDoc(docInfo, nodes, id1, id2); 
        var edgeInfo = getEdgeInfo(id1, id2, qtEachTypeCo, qtPubCo, qtEachLanCo, documents);        
        if (qtPubCo != 0) {
            edges.dataEdges.push(edgeInfo);
        }
    }

    var res2 = getRes(numNodes, numEdges, nodes, edges);
    
    var ti3 = new Date();
    var stime = parseInt(ti2 - ti1) / 1000;
    var ttime = parseInt(ti3 - ti2) / 1000;
    var total = parseInt(ti3 - ti1) / 1000;
    
    var res3 = {
        "query_time": stime,
        "trans_time": ttime,
        "total_time": total,
        "res_number": len,
        "node_number": numNodes,
        "edge_number": numEdges,
        "data_type": lb
    }
    return [res1, res2, res3];
    // res1 : Résultat SPARQL en JSON
    // res2 : Résultat de la transformation en JSON
    // res3 : Informations supplémentaires (temps d'exécution, statistiques)
}

/**
 * Test author membership in lab in order to generate color style for display
 * TODO: clean (because it walks through the whole result set once again)
 * return 1 if author = n1
 * return 2 if author = n2
 * return 3 if author = n1 && author = n2 in two different results
 */
function getLB(data, author) {
    var isInLab1 = false;
    var isInLab2 = false;
            
    for (var j = 0; j < data.length; j++) {
        if (getValue(data, j, name1) == author) {
            isInLab1 = true;
        }
        if (getValue(data, j, name2) == author) {
            isInLab2 = true;
        }
    }
                        
    if (isInLab1 && isInLab2) lb = 3;
    else if (isInLab1) lb = 1;
    else if (isInLab2) lb = 2;
    
    return lb;
}

function getRes(numNodes, numEdges, nodes, edges) {
    var data = {
        "info": {
            "qtNodos": numNodes,
            "qtArestas": numEdges
        },
        "nodes": nodes,
        "edges": edges
    };
    return data;
}

/**
* id =  node number associated to author
* shortName, author = names of the author
* qtEachType = array of numbers of documents by type of document
* qtCoauthor = number of all coauthors
* lb =  style data for graph node color
**/
function getNodeInfo(id, shortName, author, qtEachType, qtCoauthor, style, lb) {
    var not = "Not Informed";
    var nodeInfo = {
        "id": id, "idBD": id, "labels": [shortName, author, not, not, not], 
        "values": [2004, 0, 0]
            .concat(qtEachType)
            .concat([qtCoauthor, qtCoauthor, 0.1, 0.1, qtCoauthor / 2 + 1, lb]),
        "images": null
    };
    if (style != undef) {
        nodeInfo.style = style;
    }
    return nodeInfo;
}

function nodeFormat() {
   var nodes = {
        "labelTitle": ["Short Name", "Author Name", "Category", "Research", "Area"],
        "valueTitle": ["Year Last Pub", "Qt Research", "Qt Area", 
            "Qt Publications", "Qt Journals", "Qt Books", "Qt Proceedings",
            "Connected Comp.", "Edge BetWeenness", "Closeness Centrality",
            "Betweenness Centrality", "Degree"],
        "imageTitle": null,
        "dataNodes": []
    };
    return nodes;
}

function edgeFormat() {
    var edges = {
        "labelTitle": null,
        "valueTitle": ["Qt Publications", "Qt Journals", "Qt Books", "Qt Proceedings",
            "2004", "English", "Portuguese", "Spanish", "German", "French",
            "Research N.I.", "Tolerancia a falhas", "Inteligencia Artificial", "Modelagem Conceitual e BD",
            "Comp. Grafica e P.I.", "Sistemas de Tempo Real", "Arquiteture e Proj. Sist. Comp.", "Microeletronica",
            "Redes de Computadores", "Proc.Paralelo e Distr.", "Metodos formais", "Fundamentos da Computacao", "Engenharia de Software",
            "Sistemas Embarcados", "Teste e Confiabilidade", "TV Digital", "Projeto Isolado",
            "Natureza N.I.", "Trabalho Completo", "Resumo", "Capitulo", "Texto Integral", "Resumo Expandido", "Outro",
            "Area N.I.", "Sistemas de Computacao", "Sistemas de Informacao", "Inteligencia Artificial", "Eng. da Computacao", "Informatica Teorica"],
        "dataEdges": []
    };
    return edges;
}


/**
* id1 id2: node numbers of edge nodes
* qtEachTypeCo: array of number of documents by document types, with id1 id2 as coauthors (not sure graphic use it)
* qtPubCo: total number of copublications with id1 id2 as coauthors
* qtEachLanCo:  deprecated number of documents by languages
* documents: array of documents with id1 id2 as coauthors
**/
function getEdgeInfo(id1, id2, qtEachTypeCo, qtPubCo, qtEachLanCo, documents) {
    var data = {
            "src": id1,
            "tgt": id2,
            "labels": null,
            "values": qtEachTypeCo
                .concat([qtPubCo])
                .concat(qtEachLanCo)
                .concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
            "documents": documents
        };
    return data;
}


function sparql(query) {
    //query = encodeURIComponent(query);
    //query = query.replace(/\%20/g,"+");
    //query = query.replace(/\(/g, "%28");
    //query = query.replace(/\)/g, "%29");

    //var httpquery = "https://data.archives-ouvertes.fr/sparql?default-graph-uri=&query=";
    //httpquery = httpquery + query;
    //httpquery = httpquery + "&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+";
    var httpquery = query;
    //console.log(httpquery);

    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttpquery = new XMLHttpRequest();
    xmlhttpquery.open("POST", httpquery, false);
    xmlhttpquery.send();
    //console.log(xmlhttpquery.responseText);
    var res = JSON.parse(xmlhttpquery.responseText);
    //console.log(res);
    return res;
}

module.exports = {transform};
