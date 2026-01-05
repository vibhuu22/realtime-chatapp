const express = require('express');
const pool = require('../db');

const { authenticateToken } = require('../middleware/auth');

const router = express.Router(); 

// Get message history between two users

router.get('/history/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const otherUserId = parseInt(req.params.otherUserId);
    
    // Get all messages between these two users
    const result = await pool.query(
      `SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.sent_at,
        m.read_at,
        sender.username as sender_username,
        receiver.username as receiver_username
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.sent_at ASC`,
      [currentUserId, otherUserId]
    );
    
    res.json({ messages: result.rows });
    
  } catch (err) {
    console.error('Get message history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Mark messages as read
router.post('/read', authenticateToken, async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.userId;
    
    await pool.query(
      `UPDATE messages 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE id = ANY($1) 
       AND receiver_id = $2 
       AND read_at IS NULL`,
      [messageIds, userId]
    );
    
    res.json({ message: 'Messages marked as read' });
    
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE receiver_id = $1 AND read_at IS NULL`,
      [req.user.userId]
    );
    
    res.json({ unreadCount: parseInt(result.rows[0].count) });
    
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;