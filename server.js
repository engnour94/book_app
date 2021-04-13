'use strict';

// Application Dependencies
const express = require('express');


// Environment variables
require('dotenv').config();


// Application Setup
const PORT = process.env.PORT || 3030;
const server = express();


// Express middleware
server.use(express.urlencoded({extended:true}));

// Specify a directory for static resources
server.use(express.static('./public/'));
// server.use('/public', express.static('public')); // if I put in css link ./public/styles.....


// Set the view engine for server-side templating
server.set('view engine', 'ejs');


// client-side HTTP request library
const superagent = require('superagent');


// API Routes

server.get( '/', homeHandler );
// server.get( '/hello', helloHandler );
server.get( '/searches/new', newSearch );
server.post('/searches', searchHandler);


// HELPER FUNCTIONS

function homeHandler (req,res){
    res.render('pages/index');
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
    console.log(request.body.search);//from name radio
    // request.body.search[1] === 'title' ? url += `+intitle:${request.body.search[0]}` : url += `+inauthor:${request.body.search[0]}`;
    if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}&maxResults=10`; } //[ 'nour' [0], 'title'[1] ]
    if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}&maxResults=10`; } //[ 'nour', 'author' ] after console.log

    superagent.get(url)
        .then(apiData => {
            console.log(apiData.body.items);
            let bookData = apiData.body.items;
            let book = bookData.map(val => new Book(val));
            response.render('pages/searches/show', { search: book });
        }).catch(error => {
            console.log('ERROR', error);
            return response.render('pages/error', { error: error });
        });

}

function Book(data){
    this.title = data.volumeInfo.title || 'Unknown';
    this.author=data.volumeInfo.authors || ['Unknown'];
    if (!data.volumeInfo.imageLinks){
        this.image = 'https://i.imgur.com/J5LVHEL.jpg';
    }
    else {
        this.image= data.volumeInfo.imageLinks.thumbnail;
    }
    // this.image= data.volumeInfo.imageLinks
    //     ? data.volumeInfo.imageLinks.thumbnail ||'https://i.imgur.com/J5LVHEL.jpg'
    //     : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description=data.volumeInfo.description || 'not available !';

}


// Catch-all
server.get('*', (req, res) => res.status(404).send('This route does not exists'));

server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});
