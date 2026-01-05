const pool = require ('./db');

async function createTables() {
    try{
        // create user tables
        await pool.query(
            `CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(30) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            status_text VARCHAR(150),
            phone_number VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_online BOOLEAN DEFAULT FALSE
            );
            `);
            console.log ('✅ Users table created!');

        // create messages table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages(
            id SERIAL PRIMARY KEY,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            read_at TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            );
            `);
        console.log('✅ Messages table created!');

        // create indexes for better performance

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
            CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
            CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);
            `);
        console.log('✅ Indexes created!');

    console.log('\n🎉 Database setup complete!');
    process.exit(0);
    }catch(err){
        console.error('❌ Error creating tables:', err);
        process.exit(1);
    }
}

createTables();