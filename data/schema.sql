DROP TABLE IF EXISTS books;
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR (255),
    author VARCHAR (255),
    image VARCHAR (255),
    description TEXT,
    isbn VARCHAR(255),
    book_shelf VARCHAR(255)

);


INSERT INTO books (title, author,isbn, image, description,  book_shelf ) 
VALUES('Dune','Frank Herbert','ISBN_13 9780441013593','http://books.google.com/books/content?id=B1hSG45JCX4C&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api','Follows the adventures of Paul Atreides, the son of a betrayed duke given up for dead on a treacherous desert planet and adopted by its fierce, nomadic people, who help him unravel his most unexpected destiny.', 'mmm');