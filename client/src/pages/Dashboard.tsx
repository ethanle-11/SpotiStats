import { useState, useEffect } from 'react'
import { getDashboardStats } from '../api'
import type { DashboardStats } from '../api'
import RankedList from '../components/RankedList'
import StatCard from '../components/StatCard'


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
            <div className="min-h-screen bg-[#0B0D0C] overscroll-none">
                {/* Listening Minutes */}
                <div className="text-center mb-8 pt-8">
                    <p className="text-6xl text-white font-bold">{listeningData.listeningTime}</p>
                    <p className="text-lg text-gray-400">minutes listened</p>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-12">
                    <StatCard label="Unique Tracks" value={listeningData.uniqueTracks} />
                    <StatCard label="Unique Artists" value={listeningData.uniqueArtists} />
                    <StatCard label="Unique Albums" value={listeningData.uniqueAlbums} />
                </div>

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