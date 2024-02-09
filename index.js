const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.get('sendmail', (req, res) => {
    res.send('Mail sent!');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    }
);