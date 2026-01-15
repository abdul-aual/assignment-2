import { pool } from "../../config/db";

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role FROM "Users"`
  );
  return result.rows;
};

export const userService = {
  getAllUsers,
};
