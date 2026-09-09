import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getDashboardStats } from '../api'
import type { DashboardStats } from '../api'
import RankedList from '../components/RankedList'
import StatCard from '../components/StatCard'


function Dashboard() {
    const [listeningData, setListeningData] = useState<DashboardStats | null> (null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        await axios.post('/auth/logout',{})
        navigate('/', {replace: true})
    }

    useEffect(() => {
        const getStats = async () => {
            try {
                setListeningData(await getDashboardStats())
            } catch (err) {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        getStats()
    }, [])


    if (loading) {
        return (
            <p className="text-white">Loading...</p>
        )
    }
    else if (error) {
        return (
            <h1 className="text-white text-center">Couldn't retrieve listening data</h1>
        )
    }
    else if (!loading && listeningData && listeningData.topTracks.length === 0) {
        return (
            <h1 className="text-white text-center">No Listening Data</h1>
        )
    }
    else if (listeningData && listeningData.topTracks.length > 0) {
        return (
            <div className="min-h-screen bg-[#0B0D0C] overscroll-none">
                <button 
                    onClick={handleLogout}
                    className="absolute top-6 right-8 px-5 py-2 border border-[#1DB954] text-[#1DB954] font-semibold rounded-full hover:bg-[#1DB954] hover:text-black transition-colors cursor-pointer"
                >Logout</button>

                {/* Listening Minutes */}
                <div className="text-center mb-8 pt-8">
                    <p className="text-6xl text-white font-bold">{listeningData.listeningTime}</p>
                    <p className="text-lg text-gray-400">minutes listened</p>
                </div>

                {/* Secondary Stats */}
                <div className="text-center grid grid-cols-3 gap-4 max-w-md mx-auto mb-16">
                    <StatCard label="Unique Tracks" value={listeningData.uniqueTracks} />
                    <StatCard label="Unique Artists" value={listeningData.uniqueArtists} />
                    <StatCard label="Unique Albums" value={listeningData.uniqueAlbums} />
                </div>

                {/* Ranked Lists */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RankedList title="Top Tracks" items={listeningData.topTracks} getLabel={(track) => track.track_name} getImage={(track) => track.album_image_url} getPlayCount={(track) => track.play_count}/>
                    <RankedList title="Top Artists" items={listeningData.topArtists} getLabel={(artist) => artist.artist_name} getImage={(artist) => artist.artist_image_url} getPlayCount={(artist) => artist.play_count}/>
                    <RankedList title="Top Albums" items={listeningData.topAlbums} getLabel={(album) => album.album_name} getImage={(album) => album.album_image_url} getPlayCount={(album) => album.play_count}/>
                </div>

            </div>
        )
    }
}

export default Dashboard