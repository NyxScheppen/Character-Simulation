import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 15000,
})

request.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error)
    return Promise.reject(error)
  }
)

export default request