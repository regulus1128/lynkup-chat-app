import axios from 'axios'

const URL = import.meta.env.VITE_BASE_URL;

export const axiosInstance = axios.create({
    baseURL: `${URL}/api`,
    withCredentials: true
});

