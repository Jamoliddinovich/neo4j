const express = require("express")
const neo4j = require("neo4j-driver")
const path = require("path")
const uuid = require('uuid').v4
const _ = require("lodash")
require('ejs')
const app = express()
app.set('views', path.join(__dirname, "views"))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(express.static('public'))

let driver = neo4j.driver("bolt://localhost", neo4j.auth.basic('neo4j', 'password'))
let session = driver.session()

app.get('/', async (req, res) => {
    let Carray = []
    let Rarray = []
    try {
        await session.
        run("MATCH(n:Country) RETURN n").
        then((result) => {
            result.records.forEach(element => {
                a = element._fields[0].properties.title
                Carray.push(a)
            });
        })
    } catch (err) {
        console.log(err)
    }
    try {
        await session.
        run("MATCH(n:Region) RETURN n").
        then((result) => {
            result.records.forEach(element => {
                a = element._fields[0].properties.title
                Rarray.push(a)
            });
        })
    } catch (err) {
        console.log(err)
    }
    res.render("index", {
        Countries: Carray,
        Regions: Rarray
    })
})
app.post('/country/add', async (req, res) => {
    let obj = {};
    _.extend(obj, req.body)
    if (!obj.id) {
        obj.id = uuid()
    }
    if (!obj.image) {
        obj.image = "default.jpg"
    }
    if (!obj.created_at) {
        obj.created_at = Date.now()
    }
    try {
        await session.run(`create(n:Country{id:"${obj.id}",title:"${obj.title}",image:"${obj.image}",created_at:"${obj.created_at}"}) return n`).then((result) => {
            console.log("ok")
        })
    } catch (err) {
        console.log(err)
    }


    res.redirect('/')
})
app.post('/region/add', async (req, res) => {
    let obj = {};
    _.extend(obj, req.body)
    if (!obj.id) {
        obj.id = uuid()
    }
    if (!obj.created_at) {
        obj.created_at = Date.now()
    }
    try {
        await session.run(`create(n:Region{id:"${obj.id}",title:"${obj.title}",created_at:"${obj.created_at}"}) return n`).then((result) => {
            console.log("ok")
        })
    } catch (err) {
        console.log(err)
    }


    res.redirect('/')
})
app.post('/country/region/add', async (req, res) => {
    let obj = {};
    _.extend(obj, req.body)

    try {
        await session.run(`match(a:Country{title:"${obj.country}"}),(b:Region{title:"${obj.region}"}) merge(b)-[r:located]->(a) return a,b`).then((result) => {
            console.log("ok")
        })
    } catch (err) {
        console.log(err)
    }


    res.redirect('/')
})
app.listen(3000, () => {
    console.log("server is listening on port 3000")

})
