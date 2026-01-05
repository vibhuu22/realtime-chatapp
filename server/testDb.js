const pool = require ('./db') ;

async function testConnection(){
    try{
        const result = await pool.query('SELECT NOW()');
        console.log('Connection successful');
        console.log('Current time from DB:', result.rows[0]);
        process.exit(0);
    }catch(err){
        console.error('Connection failed:',err);
        process.exit(1);
    }
}

testConnection();