import express  from "express";
import { vehicleController } from "./vehicle.controller";
import { adminMiddleware } from "../../middleware/role.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/",authMiddleware, adminMiddleware, vehicleController.createVehicle);
router.get("/", vehicleController.getVehicle);
router.get("/:vehicleId", vehicleController.getSingleVehicle);
router.put("/:vehicleId", authMiddleware, adminMiddleware, vehicleController.updateVehicle);
router.delete("/:vehicleId", authMiddleware, adminMiddleware, vehicleController.deleteVehicle);

export const vehicleRoutes = router;