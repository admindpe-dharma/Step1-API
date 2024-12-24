import express from "express";
import ScannerRoute from "./routes/ScannerRoute.js";
import db from "./config/db.js";
import cors from  "cors";
import http from 'http';
import { Server } from "socket.io";
import bodyParser from "body-parser";
import { syncEmployeePIDSG, syncPendingTransaction, UpdateStatus } from "./controllers/Employee.js";
import { config } from "dotenv";
import Queue from 'bull';
import { ExpressAdapter } from "@bull-board/express";
import {createBullBoard} from '@bull-board/api';
import {BullAdapter} from '@bull-board/api/bullAdapter.js';

config({path:`.env.${process.env.NODE_ENV ?? ""}`});
const app = express();
const server = http.createServer(app);
const port = process.env.PORT;
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
const employeeSyncQueue = new Queue("Employee Syncronize Queue",{limiter:{
  max: 5,
  duration:3000
}});
const pendingSyncQueue = new Queue("Pending Transaction Queue");

employeeSyncQueue.process(async (job,done)=>{
  const res = await syncEmployeePIDSG();
  done(null,res);
});
pendingSyncQueue.process(async (job,done)=>{
  const res = await syncPendingTransaction();
  done(null,res);
});
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');
const bullBoard = createBullBoard({
  queues: [new BullAdapter(employeeSyncQueue),new BullAdapter(pendingSyncQueue)],
  serverAdapter: serverAdapter,
  options:{
    uiConfig:{
      boardTitle:process.env.NAME
    }
  }
});
app.use('/queues',serverAdapter.getRouter());
app.use(ScannerRoute);

server.listen(port, () => {
  employeeSyncQueue.add({id:1});
  pendingSyncQueue.add({id:2}); 
  console.log(`Server up and running on port ${port} with Env: .env.${process.env.NODE_ENV ?? ""}`);
});

export {io,pendingSyncQueue,employeeSyncQueue};