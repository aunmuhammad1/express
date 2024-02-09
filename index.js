const express = require('express');
const app = express();
const port = 3000;
const sendmail = require('./sendmail')

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.get('sendmail', sendmail)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    }
);