import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import projectRoutes from "./routes/project.js";
import teamRoutes from "./routes/teams.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
const app = express();
dotenv.config();

/** Middlewares */
const corsConfig = {
  credentials: true,
  origin: true,
};
app.use(cors(corsConfig));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("tiny"));
app.disable("x-powered-by");

const port = process.env.PORT || 8700;
const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT;

const connect = async () => {
  if (!mongoUri || mongoUri.includes("<username>")) {
    throw new Error(
      "MONGO_URI is missing or incomplete. Configure it in server/.env.",
    );
  }
  if (!jwtSecret) {
    throw new Error("JWT is missing. Configure it in server/.env.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("MongoDB connected");
};

app.use(express.json());
// app.enable('trust proxy'); // optional, not needed for secure cookies
// app.use(express.session({
//     secret : '123456',
//     key : 'sid',
//     proxy : true, // add this when behind a reverse proxy, if you need secure cookies
//     cookie : {
//         secure : true,
//         maxAge: 5184000000 // 2 months
//     }
// }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/team", teamRoutes);
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

const startServer = async () => {
  try {
    await connect();
    app.listen(port, () => {
      console.log(`Server connected on port ${port}`);
    });
  } catch (err) {
    console.error(`Server startup failed: ${err.message}`);
    process.exitCode = 1;
  }
};

startServer();
