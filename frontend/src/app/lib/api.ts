import axios from "axios";

//CRIA UMA INSTANCIA DO AXIOS PARA OS REQUEST's
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// api.interceptors.request.use((config) => {
//   const rawSession = localStorage.getItem("caritas.auth.session");

//   if (!rawSession) {
//     return config;
//   }

//   try {
//     const session = JSON.parse(rawSession) as {
//       token_type?: string;
//       access_token?: string;
//     };

//     if (session?.access_token && session?.token_type) {
//       config.headers.Authorization = `${session.token_type} ${session.access_token}`;
//     }
//   } catch {
//     localStorage.removeItem("caritas.auth.session");
//   }

//   return config;
// });
