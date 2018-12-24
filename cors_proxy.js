const express = require('express')
const app = new express()
const axios = require('axios')

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/api/gi/:game', async (req, res) => {
    let t = await axios.get(`https://store.steampowered.com/api/appdetails/?appids=${req.params.game}`)
    let data = t.data[req.params.game].data
    console.log(`Got data for appid ${data.steam_appid}: ${data.name}`)
    res.json(data)
})

app.listen(23132)
console.log('proxy ready')