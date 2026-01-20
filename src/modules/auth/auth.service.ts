import { pool } from "../../config/db";
import bcrypt from "bcryptjs";

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "customer";
};

const signup = async (payload: SignupPayload) => {
  const { name, email, password, phone, role } = payload;

  const existingUser = await pool.query(
    `SELECT id FROM "Users" WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email already exists");
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO "Users"(name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, role`,
    [name, email.toLowerCase(), hashedPass, phone, role]
  );

  return result.rows[0]; 
};

const signin = async (email: string, password: string) => {
  const existingUser = await pool.query(
    `SELECT * FROM "Users" WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (existingUser.rowCount === 0) {
    throw new Error("User does not exist");
  }

  const user = existingUser.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  return user;
};

export const authService = {
  signup,
  signin,
};
