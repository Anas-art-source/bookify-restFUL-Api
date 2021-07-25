const dotenv = require('dotenv');
dotenv.config({ path: "./config.env"});
const app = require('./app');
const mongoose = require('mongoose');

const http = require("http");


// CONNECTING TO DABASE
const DB = process.env.DATABASELINK.replace("<PASSWORD>", process.env.DATABASEPASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    
}).then( () => {
    console.log('CONNECTED TO DATABASE')
}).catch(err => {
    console.log(err)
})

const server = http.createServer(app);

const port = process.env.PORT || 1000;

server.listen(port, () => {
    console.log(`Listening to Port: ${port}`)
})



