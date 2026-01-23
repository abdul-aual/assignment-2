import { pool } from "../../config/db";

export interface VehiclePayload {
  vehicle_name: string;
  type: "car" | "bike" | "van" | "SUV";
  registration_number: string;
  daily_rent_price: number;
  availability_status: "available" | "booked";
}

const createVehicle = async (payload: VehiclePayload) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const result = await pool.query(
    `INSERT INTO "Vehicles"
     (vehicle_name, type, registration_number, daily_rent_price, availability_status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [vehicle_name, type, registration_number, daily_rent_price, availability_status]
  );
  const vehicle = result.rows[0];
  vehicle.daily_rent_price = Number(vehicle.daily_rent_price);
  return vehicle;
};

const getVehicle = async () => {
  const result = await pool.query(
    `SELECT * FROM "Vehicles" ORDER BY id ASC`
  );

  const vehicles = result.rows.map(vehicle => ({
    ...vehicle,
    daily_rent_price: Number(vehicle.daily_rent_price),
  }));

  return vehicles;
};

const getSingleVehicle = async(id:string)=>{
    const result = await pool.query(`SELECT * FROM "Vehicles" WHERE id=$1`, [id]);
    if (result.rows.length === 0) {
      return null; 
    }
    const vehicle = result.rows[0];
   vehicle.daily_rent_price = Number(vehicle.daily_rent_price);
   return vehicle;
};

const updateVehicle = async (id: string, payload: Partial<VehiclePayload>) => {
  const vehicleExist = await pool.query(
    `SELECT * FROM "Vehicles" WHERE id=$1`,
    [id]
  );

  if (vehicleExist.rows.length === 0) {
    throw new Error("Vehicle with this id not found");
  }

  const oldData = vehicleExist.rows[0];

  const mergedData: VehiclePayload = {
    vehicle_name: payload.vehicle_name ?? oldData.vehicle_name,
    type: payload.type ?? oldData.type,
    registration_number:
      payload.registration_number ?? oldData.registration_number,
    daily_rent_price:
      payload.daily_rent_price ?? oldData.daily_rent_price,
    availability_status:
      payload.availability_status ?? oldData.availability_status,
  };

  if (
    payload.registration_number &&
    payload.registration_number !== oldData.registration_number
  ) {
    const regCheck = await pool.query(
      `SELECT id FROM "Vehicles" WHERE registration_number=$1 AND id<>$2`,
      [payload.registration_number, id]
    );

    if (regCheck.rows.length > 0) {
      throw new Error("Registration number already in use");
    }
  }

  const result = await pool.query(
    `UPDATE "Vehicles" SET vehicle_name = $1, type = $2, registration_number = $3, daily_rent_price = $4, availability_status = $5 WHERE id = $6 RETURNING *`,
    [
      mergedData.vehicle_name,
      mergedData.type,
      mergedData.registration_number,
      mergedData.daily_rent_price,
      mergedData.availability_status,
      id,
    ]
  );
  const updatedVehicle = result.rows[0];
  updatedVehicle.daily_rent_price = Number(updatedVehicle.daily_rent_price);

  return updatedVehicle;
};

const deleteVehicle = async (id: string) => {
    const vehicle = await pool.query(`SELECT * FROM "Vehicles" WHERE id=$1`, [id]);
    if(vehicle.rows.length === 0){
      throw new Error("No Vehicle found with this Id");
    }
  
    const activeBooking = await pool.query(`SELECT id FROM "Bookings" WHERE vehicle_id=$1 AND status='active'`, [id]);
    if(activeBooking.rows.length > 0){
      throw new Error("Cannot delete vehicle with active bookings");
    }
  
    await pool.query(`DELETE FROM "Vehicles" WHERE id=$1`, [id]);
    return true;
  };
  
  
export const vehicleService = {
  createVehicle,
  getVehicle,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle
};
