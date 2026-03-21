import axios from 'axios';

const API_URL = 'http://localhost:3001'; // Your server address

// Set withCredentials to true so cookies (JWT) are sent back and forth
const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const registerUser = (userData) => instance.post('/register', userData);
export const loginUser = (credentials) => instance.post('/login', credentials);
export const logoutUser = () => instance.post('/logout');