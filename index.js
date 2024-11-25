import express from "express";
import ScannerRoute from "./routes/ScannerRoute.js";
import db from "./config/db.js";
import cors from  "cors";
import http from 'http';
import { Server } from "socket.io";
import bodyParser from "body-parser";
import { syncEmployeePIDSG, syncPendingTransaction, UpdateStatus } from "./controllers/Employee.js";
import { config } from "dotenv";
import path from "path";
config('.env');
const app = express();
const server = http.createServer(app);
const port = 5000;
 app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
/*  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers*/
  credentials:false 
}));


const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
app.use(express.static('client/build'));
/*app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });*/
app.use(bodyParser.json());

try {
  await db.authenticate();
  console.log('Database terhubung..');
  
} catch (error) {
  console.log(error);
  
}
app.use(ScannerRoute);

server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
const syncWork = async ()=>{
  await syncPendingTransaction();
  setImmediate(syncWork);
};
const syncEmp = async ()=>{
  await syncEmployeePIDSG();
  console.log('Sync Employee Data');
  setTimeout(syncEmp,10 * 10 * 1000);
};
syncWork();
export {io};