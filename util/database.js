

const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (callback) => {
    MongoClient.connect('mongodb://nisar:aseHQzUOpq2QYJOq@ac-yu89zur-shard-00-00.2kuqfqr.mongodb.net:27017,ac-yu89zur-shard-00-01.2kuqfqr.mongodb.net:27017,ac-yu89zur-shard-00-02.2kuqfqr.mongodb.net:27017/?ssl=true&replicaSet=atlas-48caiw-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0')
        .then(client => {
            console.log('Connected!')
            _db = client.db('books_store_db')
            callback()
        }).catch(err => {
            console.log(err)
            throw err
        })
}
const getDb = () => {
    if (_db) {
        return _db
    }
    throw 'No database found!'
}


exports.mongoConnect = mongoConnect
exports.getDb = getDb


