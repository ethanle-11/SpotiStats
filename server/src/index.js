import express, { response } from 'express'
import pool from './db.js'
import axios from 'axios'
import spotifyQueue from './queue.js'
import session from 'express-session'
import redisConnection from './redisClient.js'
import { RedisStore } from 'connect-redis'

const app = express()

app.use(express.json())
app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new RedisStore({ client: redisConnection })
    }))

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

    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': 'Bearer ' + response.data.access_token
        }
    })

    const token_expires_at = new Date(Date.now() + response.data.expires_in * 1000)

    const result = await pool.query(`
        INSERT INTO users (spotify_id, access_token, refresh_token, token_expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (spotify_id)
        DO UPDATE SET
            access_token = $2,
            refresh_token = $3,
            token_expires_at = $4
        RETURNING id`, 
        [profileResponse.data.id, response.data.access_token, response.data.refresh_token, token_expires_at]
    )

    const userId = result.rows[0].id
    req.session.userId = userId

    await spotifyQueue.upsertJobScheduler(
        `poll-user-${userId}`,
        { every: 5 * 60 * 1000 },
        {
            name: 'poll-user',
            data: { userId }
        }
    )
        
    res.redirect('http://127.0.0.1:5173/dashboard')

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

// dashboard route

app.get("/stats/dashboard", async (req, res) => {
    const userId = req.session.userId
    if (!userId) {
        return res.redirect(`/auth/login`)
    }

    const topTrackResults = await pool.query(`
        SELECT track_id, track_name, artist_name, album_image_url, COUNT(*) as play_count
        FROM listening_events
        JOIN users ON listening_events.user_id = users.id
        WHERE user_id = $1 AND listening_events.played_at >= users.tracking_started_at
        GROUP BY track_id, track_name, artist_name, album_image_url
        ORDER BY play_count DESC
        LIMIT 5`,
        [userId]
    )

    const topArtistResults = await pool.query(`
        SELECT listening_events.artist_name, listening_events.artist_id, artist_image_url, COUNT(*) as play_count
        FROM listening_events
        JOIN users ON listening_events.user_id = users.id        
        JOIN artists ON listening_events.artist_id = artists.artist_id
        WHERE user_id = $1 AND listening_events.played_at >= users.tracking_started_at
        GROUP BY listening_events.artist_name, listening_events.artist_id, artist_image_url
        ORDER BY play_count DESC
        LIMIT 5`,
        [userId]
    )  

    const topAlbumResults = await pool.query(`
        SELECT album_id, album_name, album_image_url, COUNT(*) as play_count
        FROM listening_events
        JOIN users ON listening_events.user_id = users.id
        WHERE user_id = $1 AND album_id IS NOT NULL AND listening_events.played_at >= users.tracking_started_at
        GROUP BY album_id, album_name, album_image_url
        ORDER by play_count DESC
        LIMIT 5`,
        [userId]
    )

    const listeningTimeResults = await pool.query(`
        SELECT SUM(duration_ms) as total_duration_ms
        FROM listening_events
        JOIN users ON listening_events.user_id = users.id
        WHERE user_id = $1 AND listening_events.played_at >= users.tracking_started_at`,
        [userId]
    )
    const duration_minutes = Math.round(listeningTimeResults.rows[0].total_duration_ms / 60000)

    const uniqueTrackResults = await pool.query(`
        SELECT COUNT(DISTINCT track_id) as unique_tracks
        FROM listening_events
        JOIN users ON listening_events.user_id = users.id
        WHERE user_id = $1 AND listening_events.played_at >= users.tracking_started_at`,
        [userId]
    )

    const uniqueArtistResults = await pool.query(`
        SELECT COUNT(DISTINCT artist_id) as unique_artists
        FROM listening_events
        JOIN users ON listening_events.user_id = users.id
        WHERE user_id = $1 AND listening_events.played_at >= users.tracking_started_at`,
        [userId]
    )

    const uniqueAlbumResults = await pool.query(`
        SELECT COUNT(DISTINCT album_id) as unique_albums
        FROM listening_events
        JOIN users ON listening_events.user_id = users.id
        WHERE user_id = $1 and album_id IS NOT NULL AND listening_events.played_at >= users.tracking_started_at`,
        [userId]
    )

    res.json({
        topTracks: topTrackResults.rows,
        topArtists: topArtistResults.rows,
        topAlbums: topAlbumResults.rows,
        listeningTime: duration_minutes,
        uniqueTracks: uniqueTrackResults.rows[0].unique_tracks,
        uniqueArtists: uniqueArtistResults.rows[0].unique_artists,
        uniqueAlbums: uniqueAlbumResults.rows[0].unique_albums
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})