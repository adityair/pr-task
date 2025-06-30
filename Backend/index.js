import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import AuthRoute from "./routes/AuthRoute.js";
import UserRoute from "./routes/UserRoute.js";
import PurchaseRequestRoute from "./routes/PurchaseRequestRoute.js";
import DepartmentRoute from "./routes/DepartmentRoute.js";
import ApprovalRoute from "./routes/ApprovalRoute.js";
import PurchaseOrderRoute from "./routes/PurchaseOrderRoute.js";

import "./models/ModelRelations.js";

dotenv.config();

const app = express();

const SessionStore = SequelizeStore(session.Store);
const store = new SessionStore({
  db: db,
});

// Database sudah disync, kolom approvedAt sudah ditambahkan
// db.sync({ alter: true })
//   .then(() => console.log("Database synchronized"))
//   .catch((err) => console.error("Sync error:", err));

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: "auto",
    },
  })
);

// Sync session store dengan database
store.sync();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.listen(process.env.APP_PORT, () => {
  console.log(`Server up and running on port ${process.env.APP_PORT}`);
});

app.use(express.json());

// Menggunakan router functions dengan pattern yang efisien
AuthRoute(app);
UserRoute(app);
PurchaseRequestRoute(app);
DepartmentRoute(app);
ApprovalRoute(app);
PurchaseOrderRoute(app);
