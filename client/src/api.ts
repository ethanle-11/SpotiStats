import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:3001'

export const getDashboardStats = async () => {
    const response = await axios.get(
        `${BASE_URL}/stats/dashboard`, {
            withCredentials: true
        })
    return response.data
}