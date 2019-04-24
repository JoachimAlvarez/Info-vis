// ---------------------------------------------------------------------------------
// Load Packages
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

var express = require('express');
var app = express();
var session = require('express-session');

// db
var db = require(path.resolve('./', 'db.js'));

// ---------------------------------------------------------------------------------
// App Config

// Sends static files from the public path directory
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json({limit: '50mb', type: 'application/json'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var server = app.listen(4000);

// Routing
var RouteDir = 'routes';
var routeFiles = fs.readdirSync(RouteDir);
routeFiles.forEach(file => {
    var filePath = path.resolve('./', RouteDir, file);
    require(filePath)(app);
});

console.log("Server Ready");