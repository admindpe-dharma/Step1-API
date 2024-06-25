import { Sequelize, Op } from "sequelize";
import db from "../config/db.js";
import waste from "./WasteModel.js";
import container from "./ContainerModel.js";

const { DataTypes } = Sequelize;

const bin = db.define('bin', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
    },
    weight: {
        type: DataTypes.DECIMAL,
    },
    IdWaste: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    max_weight: {
        type:DataTypes.DECIMAL,
    },
    name_hostname: {
        type:DataTypes.STRING,
    },
    line: {
        type:DataTypes.INTEGER,
    }

}, {
    freezeTableName: true,
    timestamps:false
});

waste.hasMany(bin, { foreignKey: 'IdWaste', as: 'bin' });
bin.belongsTo(waste, { foreignKey: 'IdWaste', as: 'waste' });

container.hasMany(bin, { foreignKey: 'id', as: 'bin' });
bin.belongsTo(container, { foreignKey: 'name', as: 'container' });

export default bin;