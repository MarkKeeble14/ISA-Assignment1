var http = require('http');
let url = require('url');
const mysql = require('mysql');
const querystring = require('querystring');

// Create Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "markkeeb_nodemysql",
    password: "nodemysql123",
    database: "markkeeb_quiz"
});

// Server
var server = http.createServer(function (req, res) {
    // Set Header
    res.writeHead(200, {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*'
    });
    
    // GET
    if (req.method == 'GET') {
        let q = url.parse(req.url, true);
        const path = q.pathname;
        
        if (path == '/quiz/quotes') {
            // Connect to DB; Select Rows
            db.connect(function (err) {
                if (err) {
                    res.end("Failed to Connect to DB: " + err);
                    throw err;
                } else {
                    let selectQuery = "SELECT * FROM quotes INNER JOIN authors on quotes.authorID = authors.authorID;";
                    db.query(selectQuery, function (err, results) {
                        if (err) {
                            res.end("Connected to DB / Failed to Fetch Rows\n" + err);
                            throw err;
                        } else {
                            res.end(JSON.stringify(results));
                        }
                    });
                }
            });
        } else if (path == '/quiz/quotes/1') {
            // Connect to DB; Select Rows
            db.connect(function (err) {
                if (err) {
                    res.end("Failed to Connect to DB: " + err);
                    throw err;
                } else {
                    let selectQuery = "SELECT * FROM quotes INNER JOIN authors on quotes.authorID = authors.authorID WHERE quotes.quoteID = (SELECT MAX(quoteID) FROM quotes);";
                    db.query(selectQuery, function (err, results) {
                        if (err) {
                            res.end("Connected to DB / Failed to Fetch Rows\n" + err);
                            throw err;
                        } else {
                            res.end(JSON.stringify(results));
                        }
                    });
                }
            });
        } else {
            res.end('URL is unimportant: ' + path);          
        }
    } else
    // POST
    if (req.method == 'POST') {
        let q = url.parse(req.url, true);
        let path = q.pathname;
        let query = q.query;
        
        if (path == '/quiz/quotes') {
            let quote = query["quote"];
            let author = query["author"];
            
            // Connect to DB; Select Rows
            db.connect(function (err) {
                if (err) {
                    res.end("Failed to Connect to DB: " + err);
                    throw err;
                } else {
                    let insertAuthor = "INSERT INTO authors (name) VALUES ('" + author + "');";
                    let insertQuote = "INSERT INTO quotes (text, authorID) VALUES ('" + quote + "', ( SELECT authorID FROM authors WHERE name='" + author + "'));";
                    return new Promise((resolve, reject) => {
                        db.query(insertAuthor, function (err, result) {
                            if (err) {
                                res.end("Connected to DB / Failed to Fetch Rows - A\n" + err);
                                throw err;
                            } else {
                                resolve(result);
                            }
                        });
                    }).then((value) => {
                        db.query(insertQuote, function (err, result) {
                            if (err) {
                                res.end("Connected to DB / Failed to Fetch Rows - Q\n" + err);
                                throw err;
                            } else {
                                res.end("Connected to DB / Inserted Quote Correctly\n" + quote + ", " + author + "\n" + result);
                            }
                        });
                    });
                }
            });
        } else if (path == '/quiz/quotes/delete') { // DELETE
            let quote = query["quote"];
            let author = query["author"];
            
            // Connect to DB; Select Rows
            db.connect(function (err) {
                if (err) {
                    res.end("Failed to Connect to DB: " + err);
                    throw err;
                } else {
                    let deleteQuote = "DELETE FROM quotes WHERE text = '" + quote + "' AND authorID = ( SELECT authorID FROM authors WHERE name='" + author + "');";
                    db.query(deleteQuote, function (err, result) {
                        if (err) {
                                res.end("Connected to DB / Failed to Delete Quote - A\n" + quote + ", " + author + "\n" + err);
                            throw err;
                        } else {
                            res.end("Connected to DB / Successfully Deleted Quote: \n " + quote + ", " + author + "\n" + result);
                        }
                    });
                }
            });
        } else if (path == '/quiz/quotes/update') {
            let quote = query["quote"];
            let author = query["author"];
        
            // Connect to DB; Select Rows
            db.connect(function (err) {
                if (err) {
                    res.end("Failed to Connect to DB: " + err);
                    throw err;
                } else {
                    let updateQuote = "UPDATE quotes SET text ='" + quote + "' WHERE quote ='" + quote + "' AND author ='" + author + "';";
                    let updateAuthor = "UPDATE authors SET name='" + author + "'  WHERE authorID=( SELECT authorID FROM quotes WHERE quoteID='" + qID + "');";
                    return new Promise((resolve, reject) => {
                        db.query(updateQuote, function (err, result) {
                            if (err) {
                                res.end("Connected to DB / Failed to Update Quote - A\n" + quote + ", " + author + "\n" + err);
                                throw err;
                            } else {
                                resolve(result);
                            }
                        });
                    }).then((value) => {
                        db.query(updateAuthor, function (err, result) {
                            if (err) {
                                res.end("Connected to DB / Failed to Update Quote - Q\n" + err);
                                throw err;
                            } else {
                                res.end("Connected to DB / Updated Quote + Author Correctly\n" + quote + ", " + author + "\n" + result + qID);
                            }
                        });
                    });
                }
            });
        } else {
            res.end('URL is unimportant: ' + path);
        }
    } else {
        res.end('URL is unimportant: ' + path);
    }
});
server.listen();