import { create } from "axios"
import { createClient } from "redis"

const redisConnection = createClient({
    socket: {
        host: 'redis',
        port: 6379
    }
})

redisConnection.connect()

export default redisConnection