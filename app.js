require('dotenv').config();
const express = require('express');
const morgan = require('morgan')
const router = require('./router/index')
const app = express();
const port = 3000

app.use(morgan('dev'));

app.use('/public',express.static('public'));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', router);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})