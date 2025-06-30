import {Sequelize} from "sequelize";

const db = new Sequelize('purchase_requisitions', 'root', '', {
    host: "localhost",
    dialect: "mysql",
    port: 3306,
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Test koneksi
db.authenticate()
    .then(() => {
        console.log('Database connection established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

export default db;