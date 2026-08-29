import axios from 'axios'
import pool from './db.js'

const refreshAccessToken = async (userId, refreshToken) => {
    const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
    })

    const response  = await axios.post(
        'https://accounts.spotify.com/api/token',
        params.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
            }
        }
    )

    const token_expires_at = new Date(Date.now() + response.data.expires_in * 1000)
    const newRefreshToken = response.data.refresh_token || refreshToken

    await pool.query(`
        UPDATE users
        SET access_token = $1, refresh_token = $2, token_expires_at = $3
        WHERE id = $4`,
        [response.data.access_token, newRefreshToken, token_expires_at, userId]
    )

    return response.data.access_token
}

export default refreshAccessToken