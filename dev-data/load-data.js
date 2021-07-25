const dotenv = require('dotenv');
dotenv.config({ path: "./config.env"});
const fs = require('fs');
const mongoose = require('mongoose');
const Users = require("../model/userModel")


console.log(process.argv)
// READING DATA 

const userData = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
console.log(userData)
// CONNECTING TO DABASE
const DB = process.env.DATABASELINK.replace("<PASSWORD>", process.env.DATABASEPASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}).then( () => {
    console.log('CONNECTED TO DATABASE')
}).catch(err => {
    console.log(err)
})


async function loadData () {
    try {
        await Users.create(userData)
    } catch (err) {
        console.log(err)
    }
}


async function DeleteData () {
    try {
        await Users.deleteMany()
    } catch (err) {
        console.log(err)
    }
}

if (process.argv[2] === "--import") {
     loadData()
}

if (process.argv[2] === '--delete') {
    try {
        DeleteData()
    } catch (err) {

    }
}