const INI = require('./ini')
const fs = require('fs')
const express = require('express')
const axios = require('axios')

if (!fs.existsSync('./proxy.ini')) {
    console.error("No proxy.ini config file found! Please create one using proxy_example.ini.")
    process.exit(1)
}

const config = INI.parse(fs.readFileSync('./proxy.ini').toString())

const app = new express()

app.get('/games/:steamid', async (req, res) => {
    try {
        const h = await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.steam.apikey}&steamid=${req.params.steamid}&format=json`)
        res.json(h.data.response.games)
    } catch(e) {
        res.status(500)
        res.send(e.toString())
    }
})

app.listen(parseInt(config.server.port))