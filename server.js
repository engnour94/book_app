'use strict';

// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');

// Environment variables
require('dotenv').config();


// Application Setup
const PORT = process.env.PORT || 3030;
const server = express();


// Express middleware
server.use(express.urlencoded({extended:true}));

// Specify a directory for static resources
server.use(express.static('./public'));
// server.use('/public', express.static('public')); // if I put in css link ./public/styles.....
server.use(methodOverride('_method'));

// Database Setup
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,
    ssl:{rejectUnauthorized: false
    }

});
// Set the view engine for server-side templating
server.set('view engine', 'ejs');


// client-side HTTP request library
const superagent = require('superagent');

// API Routes

server.get( '/', homeHandler );
// server.get( '/hello', helloHandler );
server.get( '/searches/new', newSearch );
server.post('/searches', searchHandler);
server.get('/books/:id', detailsHandler);
server.post('/books', selectHandler);
server.put('/books/:id',updateBookHandler);
server.delete('/books/:id',deleteBookHandler);
server.get('*', errorHandler);

function homeHandler (req,res){
    let SQL = `SELECT * FROM books;`;
    client.query(SQL)
        .then (result=>{
            res.render('pages/index',{booksResults:result.rows });
        }) .catch(err=>{
            res.render('error',{error:err});
        });

}

function newSearch (req, res){
    res.render('pages/searches/new');
}

// http://localhost:3000/searches

function searchHandler(request, response) {
    // let url = 'https://www.googleapis.com/books/v1/volumes?q=inauthor:noor&maxResults=10';
    // superagent (url).then (bookData=>{
    //     let data = bookData.body.items.volumeInfo.title;
    //     response.send (data);
    // }); // to get the data from link  http://localhost:3000/searches
    // 'https://www.googleapis.com/books/v1/volumes?q=';
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    // console.log(request.body);
    // console.log(request.body.search);//from name radio
    // request.body.search[1] === 'title' ? url += `+intitle:${request.body.search[0]}` : url += `+inauthor:${request.body.search[0]}`;
    if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}&maxResults=10`; } //[ 'nour' [0], 'title'[1] ]
    if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}&maxResults=10`; } //[ 'nour', 'author' ] after console.log
    //  console.log('urllllllllllllllll',url);
    superagent.get(url)
        .then(apiData => {
            // console.log(apiData.body.items);
            let bookData = apiData.body.items;
            let book = bookData.map(val => new Book(val));//book is an array
            console.log(book);
            response.render('pages/searches/show', { search: book });
        }).catch(error => {
            // console.log('ERROR', error);
            return response.render('pages/error', { error: error });
        });

}

function detailsHandler (req, res){
    // console.log (req.params);
    let SQL = `SELECT * FROM books WHERE id=$1;`;
    let safe = req.params.id;
    client.query (SQL,[safe]).then (result=>{
        res.render ('pages/books/show',{item:result.rows[0] } );
    }).catch(error => {
        // console.log('ERROR', error);
        return res.render('pages/error', { error: error });
    });
}

function selectHandler(req,res){
    console.log(req.body);
    let SQL = `INSERT INTO books (title, author,isbn, image, description,  book_shelf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`;
    let safeValues = [req.body.title,req.body.author,req.body.isbn,req.body.image,req.body.description,req.body. book_shelf];
    // console.log('hhhhhhhhhhhhhhhhhhhh',safeValues);
    // client.query(SQL,safeValues)
    //     .then(result=>{
    //         console.log(result.rows);
    //         res.redirect(`/books/${result.rows[0].id}`);
    //     });
    client.query (SQL,safeValues).then (result=>{
        console.log (result.rows);
        res.redirect(`/books/${result.rows[0].id}`);
        // res.redirect(`/`);
        // res.redirect('/books');
    });

}

function Book(data){
    // console.log(data.volumeInfo);
    // console.log(data.industryIdentifiers);
    this.title = data.volumeInfo.title ? data.volumeInfo.title : 'Not available';
    // this.title = data.volumeInfo.title || 'Unknown';
    this.author=data.volumeInfo.authors || ['Unknown'];
    // if (!data.volumeInfo.imageLinks){
    //     this.image = 'https://i.imgur.com/J5LVHEL.jpg';
    // }
    // else {
    //     this.image= data.volumeInfo.imageLinks.thumbnail;
    // }
    this.image= data.volumeInfo.imageLinks
        ? data.volumeInfo.imageLinks.thumbnail ||'https://i.imgur.com/J5LVHEL.jpg'
        : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description=data.volumeInfo.description || 'Not available !';
    this.isbn= data.volumeInfo.industryIdentifiers?data.volumeInfo.industryIdentifiers[0].identifier ||data.volumeInfo.industryIdentifiers :'Not available !' ; //there are some isbn is not in an array like obj and strings
    this.book_shelf = data.volumeInfo.categories ? data.volumeInfo.categories.join(', ') : 'Not available';

}

function updateBookHandler (req,res){
    // console.log("bodyyyyyyyy",req.body);
    // console.log('paraaaaaaams',req.params);

    let {title, author,isbn, image, description, book_shelf} = req.body;
    title, author,isbn, image, description, book_shelf;
    let SQL = `UPDATE books SET title=$1, author = $2, isbn=$3,image=$4,description=$5, book_shelf=$6 WHERE id=$7;`;
    let safeValues = [title,author,isbn,image,description,book_shelf,req.params.id];
    client.query(SQL,safeValues)
        .then(()=>{
            res.redirect(`/books/${req.params.id}`);
        });
}


function deleteBookHandler(req,res){
    let SQL = `DELETE FROM books WHERE id=$1;`;
    let value = [req.params.id];
    client.query(SQL,value)
        .then(res.redirect('/'));
}
// Catch-all
function errorHandler (req, res) {
    res.status(404).send('This route does not exists');
}


client.connect()
    .then(() => {
        server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
    });
