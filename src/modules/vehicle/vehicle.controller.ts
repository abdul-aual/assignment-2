import { Request, Response } from "express";
import { vehicleService, VehiclePayload } from "./vehicle.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status} = req.body as VehiclePayload;

    if (!vehicle_name ||!type ||!registration_number ||daily_rent_price <= 0 ||!availability_status) {
      return res.status(400).json({
        success: false,
        message:
          "vehicle_name, type, registration_number, daily_rent_price, availability_status — all fields are required and daily_rent_price should be > 0",
      });
    }

    const result = await vehicleService.createVehicle({
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getVehicle = async (req: Request, res: Response) => {
   try{
    const result = await vehicleService.getVehicle();
   if(result.rows.length===0){
    return res.status(200).json({
      "success": true,
      "message": "No vehicles found",
      "data": result.rows,
    });
   }
   return res.status(200).json({
    "success": true,
    "message": "Vehicles retrieved successfully",
    "data": result.rows,
   })

   }catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSingleVehicle=async(req:Request, res:Response)=>{
 try{
  const result = await vehicleService.getSingleVehicle(req.params.vehicleId as string);
  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not found",
      data: null
    });
  }
  res.status(200).json({
    success: true,
    message: "Vehicle retrieved successfully",
    data: result.rows[0],
    })

 }catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const payload = (req.body ?? {}) as Partial<VehiclePayload>;

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No value given to update, you can update vehicle_name, type, registration_number, daily_rent_price, availability_status"
      });
    }
    if (
      payload.daily_rent_price !== undefined &&
      payload.daily_rent_price <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "daily_rent_price must be greater than 0",
      });
    }

    const result = await vehicleService.updateVehicle(vehicleId as string, payload);

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVehicle= async(req:Request, res:Response)=>{
    try{
      await vehicleService.deleteVehicle(req.params.vehicleId as string);
      return res.status(200).json(
        {
          "success": true,
          "message": "Vehicle deleted successfully"
        })
    }catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

}

export const vehicleController = {
  createVehicle,
  getVehicle,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
