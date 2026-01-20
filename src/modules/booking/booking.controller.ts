import { Request, Response } from "express";
import { BookingPayload, bookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const user = req.user; 
    const role = user.role;
    const bookerID=user.id;
    const result = await bookingService.createBooking(req.body as BookingPayload, bookerID, role);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBookingDetails = async(req:Request, res:Response)=>{
  try {
    const user = req.user; 
    const role = user.role;       
    const userId = user.id as string;
    const bookings = await bookingService.getBookingDetails(role, userId);

    res.status(200).json({
      success: true,
      message: role === "admin"
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully",
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBookings = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.bookingId as string; 
    const { status } = req.body as { status: "cancelled" | "returned" };
    const user = req.user; 
    const role = user.role;
    const userId = user.id as string;

    const result = await bookingService.updateBooking(status, bookingId, role, userId);

    res.status(200).json(result); 
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const bookingController = {
  createBooking,
  getBookingDetails,
  updateBookings,
};
