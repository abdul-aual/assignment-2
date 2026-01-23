import express, {type Request, type Response}  from "express";

import initDB from "./config/db";
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/user/user.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";
import { bookingRoutes } from "./modules/booking/booking.routes";
const app = express();

app.use(express.json());


initDB();
app.get('/', (req:Request, res:Response) => {
  res.send('THIS IS ASSIGNMENT 2;  DORJA KHOL')
})

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);

app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:"Route not found",
        path: req.path,
    })
})

export default app;
