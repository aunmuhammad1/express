const express = require('express');
const app = express();

// Use the PORT environment variable provided by Heroku,
// or default to 3000 if running locally
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
