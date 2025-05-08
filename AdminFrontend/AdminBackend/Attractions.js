// ... existing code ...
// Health check route to verify DB connection
router.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ success: true, message: 'Database connection successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
    }
});
// ... existing code ...