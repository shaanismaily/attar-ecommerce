import axios from "axios";

const client = axios.create({
  baseURL: "shaan-parfums-backend-production.up.railway.app/api/v1",
  withCredentials: true,
});

export default client;