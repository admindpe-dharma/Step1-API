
import { Sequelize } from "sequelize";

const db = new Sequelize('rack_web','root','',{
    host: "localhost",
    dialect: "mysql"
});

export default db;
