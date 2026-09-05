import { useState, useEffect } from 'react'
import { getDashboardStats } from '../api'
import type { DashboardStats } from '../api'
import RankedList from '../components/RankedList'


function Dashboard() {
    const [listeningData, setListeningData] = useState<DashboardStats | null> (null)

    useEffect(() => {
        const getStats = async () => {
            setListeningData(await getDashboardStats())
        }
        getStats()
    }, [])

    if (listeningData) {
        return (
            <div className="min-h-screen bg-[#0B0D0C]">
                {/* Top Tracks */}
                <RankedList 
                    title="Top Tracks"
                    items={listeningData.topTracks}
                    getLabel={(track) => track.track_name}
                />

                {/* Top Artists */}
                <RankedList 
                    title="Top Artists"
                    items={listeningData.topArtists}
                    getLabel={(artist) => artist.artist_name}
                />

                {/* Top Albums */}
                <RankedList 
                    title="Top Albums"
                    items={listeningData.topAlbums}
                    getLabel={(album) => album.album_name}
                />
            </div>
        )
    } else {
        <p>Loading...</p>
    }

}

export default Dashboard