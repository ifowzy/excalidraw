import express from "express";
import { apiRouter } from "../server/api";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// On Vercel, requests to /api are rewritten or directly routed to this handler
app.use("/api", apiRouter);
app.use("/", apiRouter);

export default app;
