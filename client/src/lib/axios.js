import axios from 'axios'

const URL = import.meta.env.VITE_BASE_URL;

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? `${URL}/api` : `${URL}/api`,
    withCredentials: true
});

