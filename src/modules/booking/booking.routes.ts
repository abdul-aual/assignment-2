import express from "express";
import { bookingController } from "./booking.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = express.Router();


router.post("/", authMiddleware, bookingController.createBooking);

router.get("/", authMiddleware, bookingController.getBookingDetails);
router.put("/:bookingId", authMiddleware, bookingController.updateBookings);

export const bookingRoutes = router;
