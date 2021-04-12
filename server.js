'use strict';
// Application Dependencies
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 3030;
const server = express();

// server.use('/public', express.static('public')); // if I put in css link ./public/styles.....

server.use(express.static('./public/'));
server.use(express.urlencoded({extended:true}));
server.set('view engine', 'ejs');

const superagent = require('superagent');
server.get('/searches/new', (req, res) => res.render('pages/searches/new'));

// app.post('/searches', createSearch);

server.get('/hello',(req,res)=>{
    res.render('pages/index');
});


// http://localhost:3000/searches
server.post('/searches', searchHandler);
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
// server.get('*', (req, res) => res.status(404).send('This route not exists'));

server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});
