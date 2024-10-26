import { Sequelize } from "sequelize";

const db = new Sequelize("rack_web", "pcs", "123456", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export default db;
