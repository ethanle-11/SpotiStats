import express from 'express'
import pool from './db.js'

const app = express()

app.use(express.json())

app.get("/health", (req, res) => {
    res.json({ status: 'ok'})
})

app.get("/db-health", async (req, res) => {
    const result = await pool.query('SELECT NOW()')
    res.json({ time: result.rows[0] })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})