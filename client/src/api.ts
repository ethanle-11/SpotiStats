import axios from 'axios'

type Track = {
    track_id: string
    track_name: string
    artist_name: string
    play_count: string
    album_image_url: string
}

type Artist = {
    artist_name: string
    play_count: string
}

type Album = {
    album_id: string
    album_name: string
    play_count: string
    album_image_url: string
}

export type DashboardStats = {
    topTracks: Track[]
    topArtists: Artist[]
    topAlbums: Album[]
    listeningTime: number
    uniqueTracks: string
    uniqueArtists: string
    uniqueAlbums: string
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await axios.get(`/stats/dashboard`)
    return response.data
}