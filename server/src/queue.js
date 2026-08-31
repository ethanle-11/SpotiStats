import { Queue } from 'bullmq'
import 'dotenv/config'

const connection = {
    host: 'redis',
    port: 6379
}

const spotifyQueue = new Queue("spotify-polling", { connection })

export default spotifyQueue