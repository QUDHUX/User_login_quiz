const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql');
const cookieParser = require('cookie-parser')
dotenv.config({path: './config.env'});

const app = express();
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE_NAME
});

const publicDirectory = path.join(__dirname, './public' );
app.use(express.static(publicDirectory));
app.set('view engine', 'ejs');

db.connect((error) =>{
    if(error){
        console.log(error)
    }else{
        console.log('connected successfully');
    }
})



app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));




app.listen(5000, ()=> console.log(`listen to port 5000`));