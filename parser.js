"use strict";
var expat = require('node-expat');
var fs = require('fs');
var mysql = require('mysql');

/*
 Database
 */

var connection = connection = mysql.createConnection({
	host: 'localhost',
	database: 'test'
});
connection.connect(function (error) {
	if (error != null) {
		console.error('MySQL connection error: ', error);
	}
});

/*
 Parsing
 */

var tag, book = {}, books = [];
var elementPath = '';

var p = new expat.Parser('UTF-8');
p.on('startElement', function (name, attrs) {
	tag = name;
	elementPath += '/' + tag;
//	console.log('[start] ', tag);

	switch (tag) {
		case 'pgterms:etext':
			book = {};
			book.id = book.url = book.image = book.title = book.createDate = book.creator = book.language = null;
			book.id = attrs['rdf:ID'].substr(5);
			book.url = 'http://www.gutenberg.org/ebooks/' + book.id;
			book.image = 'http://www.gutenberg.org/files/' + book.id + '/' + book.id + '-h/images/cover.jpg';
			break;
		case 'dc:title':
			break;
	}
});

p.on('text', function (text) {
	text = text.trim();

	if (!text) {
		return;
	}

	switch (tag) {
		case 'dc:publisher':
//			book.publisher = text;
			break;
		case 'pgterms:friendlytitle':
//			book.title = (book.title) ? book.title + ' ' + text : text;
			book.title = text;
			break;
		case 'rdf:value':
			if (elementPath.indexOf('dc:language') >= 0) {
				book.language = text;
			} else if (elementPath.indexOf('dc:created') >= 0) {
				book.createDate = text;
			}
			break;
		case 'dc:creator':
			book.creator = text;
			break;
	}
});

p.on('endElement', function (name) {
//	console.log('[end] ', name);
	elementPath = elementPath.substring(0, elementPath.length - name.length - 1);
	switch (name) {
		case 'pgterms:etext':
//			books.push(book);
			console.log(book);
			putIntoDatabase(book);
			break;
	}
});

p.on('end', function () {
//	console.log('===== Finish parsing');
//	console.log(books);
	connection.end();
});

p.on('error', function (error) {
	console.log('error: at line:' + p.getCurrentLineNumber() + ' col:' + p.getCurrentColumnNumber(), error);
});

var filename = process.argv[2];
if (filename == null) {
	console.log('Nothing to parse');
	return;
}

var mystic = fs.createReadStream(filename);
mystic.pipe(p);

var cacheCount = 0;
var queryHead = 'INSERT INTO `ebook` (`title`,`author`,`date`,`language`,`url`) VALUES ';
var query;
function putIntoDatabase(book) {
	for (var field in book) {
		if (book[field]) {
			book[field] = book[field].replace(/"/g, '\\"');
		}
	}

	var valueText = '("' + book.title + '","' + book.creator + '","' + book.date + '","' + book.language + '","' + book.url + '")';
	connection.query(queryHead + '(' + valueText + ')', function (err, rows, fields) {
		if (err) {
			console.log('[error] on ', book);
			console.log(err);
			return;
		}
	});
}