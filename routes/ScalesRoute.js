import express from "express";
import {getScales4Kg, getScales50Kg} from "../controllers/Scales.js"

const router = express.Router();

router.get('/Scales4Kg',  getScales4Kg);
router.get('/Scales50Kg', getScales50Kg);


export default router;