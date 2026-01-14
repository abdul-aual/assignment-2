import express, {type Request, type Response}  from "express";
import config from "./config"
import initDB from "./config/db";
import { authRoutes } from "./modules/auth/auth.routes";
const app = express();
const port = config.port;
app.use(express.json());


initDB();
app.get('/', (req:Request, res:Response) => {
  res.send('THIS IS ASSIGNMENT 2;  DORJA KHOL')
})

app.use("/api/v1/auth", authRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
