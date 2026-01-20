import { pool } from "../../config/db";

export interface BookingPayload {
  customer_id: string; 
  vehicle_id: string;
  rent_start_date: string;
  rent_end_date: string;
};

const createBooking = async (payload: BookingPayload, bookerID:string, role: "customer" | "admin") => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  if (role === "customer" && customer_id !== bookerID) {
    throw new Error(`Customer can not book with others ID. Your ID is ${bookerID}`);
  }

  const vehicleQuery = await pool.query(
    `SELECT * FROM "Vehicles" WHERE id=$1`,
    [vehicle_id]
  );

  if (vehicleQuery.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleQuery.rows[0];

  const start = new Date(rent_start_date);
  const end = new Date(rent_end_date);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid dates");
  }

  if (end < start) {
    throw new Error("rent_end_date must be after rent_start_date");
  }

  if (vehicle.availability_status === "booked") {
    throw new Error("Vehicle is already booked");
  }

  const dayCount =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const total_price = Number(vehicle.daily_rent_price) * dayCount;

  const bookingResult = await pool.query(
    `INSERT INTO "Bookings"
     (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING *`,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
  );

  await pool.query(
    `UPDATE "Vehicles" SET availability_status='booked' WHERE id=$1`,
    [vehicle_id]
  );

  const bookingId = bookingResult.rows[0].id;

  const bookingWithVehicle = await pool.query(
    `
    SELECT
      b.id,
      b.customer_id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      v.vehicle_name,
      v.daily_rent_price
    FROM "Bookings" b
    JOIN "Vehicles" v ON b.vehicle_id = v.id
    WHERE b.id = $1
    `,
    [bookingId]
  );

  const row = bookingWithVehicle.rows[0];
  return {
    id: row.id,
    customer_id: row.customer_id,
    vehicle_id: row.vehicle_id,
    rent_start_date: row.rent_start_date,
    rent_end_date: row.rent_end_date,
    total_price: row.total_price,
    status: row.status,
    vehicle: {
      vehicle_name: row.vehicle_name,
      daily_rent_price: row.daily_rent_price,
    },
  };
};

const getBookingDetails = async (role: "admin" | "customer", userId: string) => {

await autoUpdateVehicleAvailability();

  if (role === "customer") {
    const result = await pool.query(`
      SELECT 
        b.id AS booking_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        v.vehicle_name,
        v.registration_number,
        v.type
      FROM "Bookings" b
      JOIN "Vehicles" v ON b.vehicle_id = v.id
      WHERE b.customer_id= $1
    `, [userId]);

    return result.rows.map((row) => ({
      id: row.booking_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: row.total_price,
      status: row.status,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type,
      },
    }));
  }

  if (role === "admin") {
    const result = await pool.query(`
      SELECT 
        b.id AS booking_id,
        b.customer_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        c.name AS customer_name,
        c.email AS customer_email,
        v.vehicle_name,
        v.registration_number
      FROM "Bookings" b
      JOIN "Users" c ON b.customer_id = c.id
      JOIN "Vehicles" v ON b.vehicle_id = v.id
    `);

    return result.rows.map((row) => ({
      id: row.booking_id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: row.total_price,
      status: row.status,
      customer: {
        name: row.customer_name,
        email: row.customer_email,
      },
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
      },
    }));
  }

  
  return [];
};

const updateBooking = async (status: "cancelled" | "returned", bookingId: string, role: "admin" | "customer",
userId: string ) => {

  const bookingQuery = await pool.query(
    `SELECT * FROM "Bookings" WHERE id = $1`,
    [bookingId]
  );
  
  if (bookingQuery.rows.length === 0) {
    throw new Error("Booking does not exist");
  }
  
  if (bookingQuery.rows[0].status !== 'active') {
    throw new Error("There is no active booking with this bookingid");
  }
  
  const booking = bookingQuery.rows[0];


  if (role === "customer") {
    if (booking.customer_id !== userId) {
      throw new Error("You can only cancel your own booking");
    }
    if (status !== "cancelled") {
      throw new Error("Customer can only cancel a booking");
    }
  
    const result = await pool.query(
      `UPDATE "Bookings" SET status = $1 WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );
  
    await pool.query(
      `UPDATE "Vehicles" SET availability_status='available' WHERE id=$1`,
      [booking.vehicle_id]
    );
  
    return {
      success: true,
      message: "Booking cancelled successfully",
      data: {
        ...result.rows[0],
        vehicle: { availability_status: "cancelled" },
      },
    };
  }
  

  if (role === "admin") {
    if (status !== "returned") {
      throw new Error("Admin can only mark booking as returned");
    }

    const result = await pool.query(
      `UPDATE "Bookings" SET status = $1 WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );

    await pool.query(
      `UPDATE "Vehicles" SET availability_status='available' WHERE id = $1`,
      [booking.vehicle_id]
    );

    return {
      success: true,
      message: "Booking marked as returned. Vehicle is now available",
      data: {
        ...result.rows[0],
        vehicle: { availability_status: "available" },
      },
    };
  }

  throw new Error("Invalid role or action");
};


const autoUpdateVehicleAvailability = async () => {
  const today = new Date();
  await pool.query(`
    UPDATE "Vehicles" v
    SET availability_status = 'available'
    FROM "Bookings" b
    WHERE v.id = b.vehicle_id
      AND b.status = 'active'
      AND b.rent_end_date < $1
  `, [today]);
};


export const bookingService = {
  createBooking,
  getBookingDetails,
  updateBooking,
  autoUpdateVehicleAvailability,
};
