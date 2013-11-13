var mysql = require('mysql');
var connection = mysql.createConnection({
  host:'localhost',
  database: 'test'
});

connection.connect(function(error) {
  if (error != null) {
    console.error('MySQL connection error: ', error);
  }
});

connection.query('select * from test', function(err, rows, fields) {
  if (err) {
  	throw err;
  }

  console.log('rows: ', rows);
});

connection.end();