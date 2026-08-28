import { Worker } from 'bullmq'
import 'dotenv/config'

const connection = {
    host: 'redis',
    port: 6379
}

const pollUser = async (job) => {
    console.log("Processing job: ", job.data)
}

const spotifyPoller = new Worker('spotify-polling', pollUser, { connection })