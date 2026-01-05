const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Registration endpoint

router.post('/register',async(req,res)=>{
    try{
        const{ username, email, password, first_name, last_name} = req.body ;
        // validation

        if(!username || !email || !password){
            return res.status(400).json({
                error: 'Username, email and password are required'
            });
        }
    

    // check if username already exists

    const userCheck = await pool.query (
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username,email]
    );

    if(userCheck.rows.length > 0 ){
        return res.status(400).json({
            error : 'Username or email already exists'
        });
    }

    // Hash password

    const saltRounds = 10 ;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert User

    const result = await pool.query(
        `INSERT INTO users (username,email,password_hash, first_name ,last_name) 
        VALUES ($1, $2, $3,$4, $5) 
        RETURNING id, username, email, first_name, last_name, created_at`,
        [username, email, password_hash, first_name, last_name]   
    );

    res.status(201).json({
        message: 'User registered successfully',
        user : result.rows[0]
    });
    }
    catch (err){
        console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
    }
});


router.post('/login',async (req,res)=>{
    try{
        const {username,password} = req.body ;

        // validation
        if(!username || !password){
            return res.status(400).json({
                error: 'Username and password are required'
            });
        }
        
        // find user by username

        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if(result.rows.length === 0 ){
            return res.status(400).json({
                error:'Invalid username or password'
            });
        }

        const user = result.rows[0];

        // verify password

        const isValidPassword = await bcrypt.compare(password, user.password_hash) ;

        if(!isValidPassword){
            return res.status(401).json({
                error : 'Invalid username or password'
            });
        }

        // Generate JWT Token

        const token = jwt.sign(
            {
                userId : user.id,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn : process.env.JWT_EXPIRES_IN || '7d' }
        );

        // update last seen

        await pool.query(
            'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // return token and user info
        res.json({
            message: 'Login successful',
            token,
            user:{
                id : user.id,
                username : user.username,
                email : user.email,
                first_name : user.first_name,
                last_name: user.last_name,
                created_at: user.created_at
            }
        });
    }catch(err){
        console.log('Login error : ',err);
        res.status(500).json({error:'Server error'});
    }
});

module.exports = router ;

