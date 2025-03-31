import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import routes from "./routes";
import path from "path";
import database from "./utils/database";
import { SuperAdminSeeder } from "./db/seeds/user";
import { sendEmails } from "./db/seeds/notify-mail";
import { send } from "process";

dotenv.config();

const app = express();

app.use(cors());

const server: http.Server = http.createServer(app);

app.use(express.json());

const uploadsDir = path.join(__dirname, "../uploads");

app.use("/uploads", express.static(uploadsDir));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// routes
app.use("/v1", routes);

// seeder
SuperAdminSeeder();

sendEmails();

database.once("open", () => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
  });
});

database.on("error", (error: any) => {
  console.error("Error connecting to database", error);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});
