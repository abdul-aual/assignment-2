import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: config.connection_str,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin','customer'))
      );
    `);
    console.log("Users table created or already exists");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Vehicles" (
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('car','bike','van','SUV')),
        registration_number VARCHAR(50) NOT NULL UNIQUE,
        daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price > 0),
        availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('available','booked'))
      );
    `);
    console.log("Vehicles table created or already exists");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Bookings" (
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
        vehicle_id INT NOT NULL REFERENCES "Vehicles"(id) ON DELETE CASCADE,
        rent_start_date DATE NOT NULL,
        rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
        total_price NUMERIC(10,2) NOT NULL CHECK (total_price > 0),
        status VARCHAR(20) NOT NULL CHECK (status IN ('active','cancelled','returned'))
      );
    `);
    console.log("Bookings table created or already exists");

  } catch (err: any) {
    console.error("Error creating tables:", err.message);
  }
};

export default initDB;

