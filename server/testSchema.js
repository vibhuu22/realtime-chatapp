const pool = require('./db');

async function testSchema(){
    try{
        // Insert a test user
        const userResult = await pool.query(
            `INSERT INTO users (username,email,password_hash, first_name, last_name)
            VALUES($1, $2, $3, $4, $5)
            RETURNING *;
            `, ['vibhu_test','vibhu@test.com', 'hashed_password_here', 'Vibhanshu', 'Chaturvedi']);

            console.log('✅ User created:', userResult.rows[0]);

        // Insert a test message ( to yourself for now )

        const userId = userResult.rows[0].id ;

        const messageResult = await pool.query(`
            INSERT INTO messages (sender_id, receiver_id, content)
            VALUES ($1,$2,$3)
            RETURNING *;
            `,[userId, userId, 'Hello, this is my first message!']);

            console.log('✅ Message created:', messageResult.rows[0]);

            // Query messages with user info
    const messagesWithUsers = await pool.query(`
      SELECT 
        m.id,
        m.content,
        m.sent_at,
        sender.username as sender_username,
        receiver.username as receiver_username
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id;
    `);
    
    console.log('✅ Messages with usernames:', messagesWithUsers.rows);
    
    process.exit(0);
    }catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

testSchema();