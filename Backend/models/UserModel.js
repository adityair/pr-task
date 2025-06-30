import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Departments from "./DepartmentModel.js";

const {DataTypes} = Sequelize;

const Users = db.define('users',{
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        validate:{
            notEmpty: true
        }
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            len: [3, 100]
        }
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            isEmail: true
        }
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    role:{
        type: DataTypes.ENUM('staff', 'manager', 'head_department', 'admin'),
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    departmentId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            notEmpty: true
        },
        references: {
            model: 'departments',
            key: 'id'
        }
    }
},{
    freezeTableName: true
});

Users.belongsTo(Departments, {foreignKey: 'departmentId'});
Departments.hasMany(Users, {foreignKey: 'departmentId'});

export default Users;