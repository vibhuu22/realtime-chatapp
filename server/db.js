require('dotenv').config();
const {Pool} = require('pg');



const pool = new Pool ({
    user : process.env.DB_USER || 'chatuser',
    host : process.env.DB_HOST || 'localhost',
    database : process.env.DB_NAME || 'chatapp',
    password: process.env.DB_PASSWORD || 'user123',
    port : process.env.DB_PORT || 5432,
});


// Test Connection

pool.query('SELECT NOW()', (err,res)=>{
    if(err){
        console.log('Database connection error:', err) ;
    }else{
        console.log('Database connected : ', res.rows[0]);
    }
});

module.exports= pool ;