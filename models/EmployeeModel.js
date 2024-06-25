import { Sequelize, Op } from "sequelize";
import db from "../config/db.js";
import Waste from "./WasteModel.js";

const { DataTypes } = Sequelize;

const employee = db.define('employee', {
    badgeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey:true
    },
    username: {
        type: DataTypes.STRING,
    }
}, {
    freezeTableName: true
});

Waste.hasMany(employee, { foreignKey: 'IdWaste', as: 'employee' });
employee.belongsTo(Waste, { foreignKey: 'IdWaste', as: 'waste' });

export default employee;