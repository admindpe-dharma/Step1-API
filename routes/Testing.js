import express from "express";
import {TriggerLock} from "../controllers/TriggerLock.js"

const router = express.Router();

router.post('/triggerLock', TriggerLock);


export default router;