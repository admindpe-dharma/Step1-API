import { config } from "dotenv";
import { Sequelize } from "sequelize";
config();
const db = new Sequelize(process.env.DATABASE, "pcs", "123456", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export default db;
