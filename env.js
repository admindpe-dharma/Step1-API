import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
const __dirname = dirname( fileURLToPath(import.meta.url));
console.log(resolve(__dirname,`.env.${process.env.NODE_ENV ?? ""}`));
dotenv.config({path:resolve(__dirname,`.env.${process.env.NODE_ENV ?? ""}`)});
