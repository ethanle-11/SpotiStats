import axios from 'axios'

export const getDashboardStats = async () => {
    const response = await axios.get(`/stats/dashboard`)
    return response.data
}