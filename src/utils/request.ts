import type { AxiosRequestConfig } from "axios"
import axios from "axios"



const instance = axios.create({
  baseURL: "http://localhost:5285/api",
  headers: {
    "Content-Type": "application/json"
  }
})

export const request = async(config: AxiosRequestConfig) => {
  return instance({
    ...config,
  })
}