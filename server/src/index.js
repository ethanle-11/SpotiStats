import express from 'express'
import pool from './db.js'
import axios from 'axios'

const app = express()

app.use(express.json())

app.get("/auth/callback", async (req, res) => {
    const code = req.query.code

    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI
    })

    const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        params.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
            }
        }
    )

    res.json(response.data)
})

app.get("/auth/login", (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        scope: 'user-read-recently-played'
    })

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})