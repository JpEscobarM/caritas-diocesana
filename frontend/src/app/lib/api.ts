import axios from "axios";
import { getAuthSession } from "./auth";

//CRIA UMA INSTANCIA DO AXIOS PARA OS REQUEST's
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

//FUNCAO QUE CONFIGURA AXIOS PARA USAR A SESSAO DO LOCALSTORAGE E ENVIAR
//O ACCESS_TOKEN DO USUARIO EM CADA REQUISICAO
api.interceptors.request.use((config) => {
  const session = getAuthSession();

  if (session) {
    config.headers.Authorization = `${session.token_type} ${session.access_token}`;
  }

  return config;
});
