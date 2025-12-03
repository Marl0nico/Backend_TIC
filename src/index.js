import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// Routers
import routerEstudiantes from "./routers/estudiante_routes.js";
import routerAdmin from "./routers/administrador_routes.js";
import routerComunidades from "./routers/comunidades_routes.js";
import routerComentarios from "./routers/comentarios_routes.js";
import routerMensajes from "./routers/mensajes_routes.js";
import routerPublicaciones from "./routers/publicaciones_routes.js";

// Socket & DB
import { app, server } from "./config/socket.js";
import connection from "./database.js";

// =========================
//      CORS CONFIG
// =========================
const allowedOrigins = [
  process.env.URL_FRONTEND,
  
  "https://proyecto-tic25.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Manejo de preflight (evita errores con POST/PUT)
app.options("*", cors());

// =========================
//      Middleware
// =========================
app.use(express.json());

// =========================
//        Rutas
// =========================
app.use("/api", routerEstudiantes);
app.use("/api", routerAdmin);
app.use("/api", routerComunidades);
app.use("/api", routerComentarios);
app.use("/api", routerMensajes);
app.use("/api", routerPublicaciones);

app.get("/api/health", (req, res) => {
  res.send("API funcionando correctamente");
});

// 404
app.use((req, res) => {
  res.status(404).send("Endpoint no encontrado - 404");
});

// =========================
//        Servidor
// =========================
app.set("port", process.env.PORT || 3000);

server.listen(app.get("port"), () => {
  console.log(`Server running on port: ${app.get("port")}`);
  connection();
});
