import 'dotenv/config'
import { Worker } from 'bullmq'
import pool from './db.js'
import axios from 'axios'

import refreshAccessToken from './refreshToken.js'

const connection = {
    host: 'redis',
    port: 6379
}

const pollUser = async (job) => {
    const userId = job.data.userId

    const result = await pool.query(`
        SELECT access_token, refresh_token, token_expires_at
        FROM users
        WHERE id = $1`,
        [userId]
    )

    const { refresh_token, token_expires_at } = result.rows[0]
    let access_token = result.rows[0].access_token

    if (Date.now() > token_expires_at.getTime()) {
        access_token = await refreshAccessToken(userId, refresh_token)
    }

    const listeningData = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    })

    const artistIds = new Set()
    for (const item of listeningData.data.items) {
        await pool.query(`
            INSERT INTO listening_events (
                user_id, track_id, track_name, artist_name, duration_ms, played_at, artist_id, album_id, album_name, album_image_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (user_id, track_id, played_at) DO NOTHING`,
            [userId, item.track.id, item.track.name, item.track.artists[0].name, item.track.duration_ms, item.played_at, item.track.artists[0].id, item.track.album.id, item.track.album.name, item.track.album.images[0].url]
        )
        artistIds.add(item.track.artists[0].id)
    }
    const artistIdArray = Array.from(artistIds)

    const artistResult = await pool.query(`SELECT artist_id FROM artists WHERE artist_id = ANY($1)`, [artistIdArray])
    const existingIds = new Set(artistResult.rows.map(row => row.artist_id))
    const missingIds = artistIdArray.filter(id => !existingIds.has(id))

    for (const id of missingIds) {
        const artistData = await axios.get(`https://api.spotify.com/v1/artists/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + access_token 
            }
        })

        await pool.query(`
            INSERT INTO artists (
                artist_id, artist_name, artist_image_url
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (artist_id) DO NOTHING`,
            [artistData.data.id, artistData.data.name, artistData.data.images[0].url]
        )
    }
}

const spotifyPoller = new Worker('spotify-polling', pollUser, { connection })