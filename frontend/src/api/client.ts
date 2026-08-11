import axios from "axios";

const client = axios.create({
    baseURL: "https://shaan-parfums-backend-production.up.railway.app/api/v1",
    withCredentials: true
})

export default client;