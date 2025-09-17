import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" }); // backend

export const getMessage = () => API.get("/");