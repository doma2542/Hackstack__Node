const mongoose = require("mongoose")

const MONGODB_URL = 'mongodb+srv://swaroopnani:1234@cluster-1.huucn2p.mongodb.net/new-user-datadb?retryWrites=true&w=majority&appName=Cluster-1'

exports.connect = () => {
    mongoose.connect(MONGODB_URL)
    .then()
    .catch((error) => {
        console.log(`DB connection FAILED`);
        console.log(error);
        process.exit(1)
    })
}