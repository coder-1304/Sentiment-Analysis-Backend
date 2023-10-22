const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cors = require("cors");
const connectionModule = require('./Database/db_connect.js');

app.get("/", (req, res)=>{
    res.send("<h1>My home page</h1>")
});
const routes = require('./routes/index.js');
const port = process.env.PORT || 5001

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes)
app.listen(port,()=>{
    console.log('Server listening on port '+port);
})
