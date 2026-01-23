import { pool } from "../../config/db";

export interface UserPayload {
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
};

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role FROM "Users"`
  );
  return result.rows;
};

const updateUser=async(payload: Partial<UserPayload>, reqId:string, role:string)=>{

  const existingUser = await pool.query(`SELECT * FROM "Users" WHERE ID=$1`, [reqId]);
  if(existingUser.rows.length===0){
    throw new Error("User does not exist");
  };
const oldData = existingUser.rows[0];
if (role === "customer" && payload.role && payload.role !== oldData.role) {
  throw new Error("Customer cannot update own role");
}
const mergedData = {
  name: payload.name ?? oldData.name,
  email: payload.email ?? oldData.email,
  phone: payload.phone ?? oldData.phone,
  role: payload.role ?? oldData.role
};
if(payload.email && payload.email !== oldData.email){
  const emailCheck = await pool.query(`SELECT id FROM "Users" WHERE email=$1 AND id<>$2`, [payload.email, reqId]);
  if(emailCheck.rows.length>0){
    throw new Error("Email already in use");
  }
};
const result = await pool.query(`UPDATE "Users" SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING id, name, email,phone,role`,[mergedData.name, mergedData.email, mergedData.phone, mergedData.role, reqId]);
return result;
};

const deleteUser=async(userId:string)=>{

  const checkUser = await pool.query(`SELECT id from "Users" WHERE id=$1`, [userId]);
  if(checkUser.rows.length===0){
    throw new Error("User does not exist");
  }
  const checkUserBookings=  await pool.query(`SELECT id FROM "Bookings" WHERE customer_id=$1 AND status='active'`, [userId]); //and status =active hobe
  if(checkUserBookings.rows.length>0){
    throw new Error("User has active Bookings, can not be deleted");
  };
  await pool.query(`DELETE FROM "Users" WHERE id=$1`, [userId]);
  return true;
}

export const userService = {
  getAllUsers,
  updateUser,
  deleteUser,
};
