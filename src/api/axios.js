import axios from 'axios';
import { supabase } from '../lib/supabase';

const api = axios.create({
  //baseURL: 'https://smart-campus-backend-t273.onrender.com/api',
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default api;