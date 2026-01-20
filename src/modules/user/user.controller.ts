import { Request, Response } from "express";
import { UserPayload, userService } from "./user.service";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser=async(req:Request, res:Response)=>{
  try{
    const user =req.user;
    const role=user.role;
    const userId=user.id;
    const requestId=req.params.userId ;
    const payload =(req.body??{}) as Partial<UserPayload>;
    if(role==="customer" && userId.toString() !==requestId?.toString()){
      return res.status(403).json({
        success: false,
        message: `user can not access others.your id ${userId}`,
      });
    }
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No value given to update, you can update name,email,phone,role"
      });
    };

    const result = await userService.updateUser(payload,requestId as string, role );
    return res.status(200).json({
      success:true,
      message: "User updated successfully",
      data: result.rows[0],
    })
    
  }catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser=async(req:Request, res:Response)=>{
  try{
    const userId = req.params.userId;
    await userService.deleteUser(userId as string);
    return res.status(200).json(
      {
        "success": true,
        "message": "User deleted successfully"
      })
  }catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const userController = {
  getAllUsers,
  updateUser,
  deleteUser,
};
