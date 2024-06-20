const path = require('path');
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON
app.use(express.json());

// Route to get driver data from OpenF1 API
app.get('/api/drivers', async (req, res) => {
    const { race, year } = req.query;
    try {
        const response = await axios.get(`https://api.openf1.org/v1/races/${race}/${year}/results`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
