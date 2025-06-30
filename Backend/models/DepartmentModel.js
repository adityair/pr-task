import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const {DataTypes} = Sequelize;

const Departments = db.define('departments',{
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
        },
    },
    
});

Departments.associate = (models) => {
    Departments.hasMany(models.User, {
        foreignKey: 'departmentId',
        as: 'users'
    });
};

export default Departments;