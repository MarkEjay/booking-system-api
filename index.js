const express = require('express');
const app = express();
require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
//const expenseRoutes = require('./routes/expense')
const userRoutes = require('./routes/user')
const merchantRoutes = require('./routes/merchant')



app.use(cors())
// app.use(express.json());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

const db = process.env.dbUrl
mongoose.set("strictQuery", false);

mongoose.connect(db, { useNewUrlParser: true})
    .then(() => console.log('connected to db'))
    .catch(err => console.log(err))

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5009;

app.listen(port, () => console.log('listening on port 5009'))

app.get('/main', (req, res) => {
    res.send('Hello World')
})

app.use('/api/user', userRoutes)
app.use('/api/merchant', merchantRoutes)
