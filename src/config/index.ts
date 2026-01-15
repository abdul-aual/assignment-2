import dotenv from "dotenv";
import path from "path";
dotenv.config({path:path.join(process.cwd(), ".env")});
const config = {
    connection_str:process.env.CONNECTION_STR,
    port:process.env.PORT,
    jwt_secret: process.env.JWT_SECRET as string
};

export default config;