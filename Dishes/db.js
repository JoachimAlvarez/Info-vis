var mysql = require('mysql');

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "foodb"
});

db.connect(err => {
  if (err) { throw err; }
  console.log("Connected to Database!");
});
db.on('error', err => {
    console.log('db error', err);
});

module.exports = db;