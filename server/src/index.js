import express from 'express'
import pool from './db.js'

const app = express()

app.use(express.json())

app.get("/db-health", async (req, res) => {
    const result = await pool.query('SELECT NOW()')
    res.json({ time: result.rows[0] })
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