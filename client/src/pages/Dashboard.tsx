import { useState, useEffect } from 'react'
import { getDashboardStats } from '../api'

function Dashboard() {
    const [listeningData, setListeningData] = useState(null)

    useEffect(() => {
        const getStats = async () => {
            setListeningData(await getDashboardStats())
        }
        getStats()
    }, [])

    return listeningData ? listeningData.topTracks.map((track) => (
        <div key={track.track_id}>
            <p>{track.track_name}</p>
        </div>
    )) : <p>Loading...</p>

}

export default Dashboard