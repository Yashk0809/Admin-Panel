import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';


const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});



export default api;