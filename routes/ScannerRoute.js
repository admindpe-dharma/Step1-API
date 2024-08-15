
import express from "express";
import {ScanBadgeid,ScanContainer,CheckBinCapacity,SaveTransaksi,UpdateBinWeight,UpdateBinWeightCollection,VerificationScan,getTransactionList,UpdateDataFromStep2,ScanMachine,UpdateLineContainer, UpdateStatus,getIdscaplog, getIdmachine, UpdateTransaksi, checkTransaksi, syncTransaction, DeleteTransaksi} from "../controllers/Employee.js"
//import {getbinData} from "../controllers/Bin.js"

const router = express.Router();

router.post('/ScanBadgeid', ScanBadgeid);
router.post('/ScanContainer', ScanContainer);
router.post('/ScanMachine', ScanMachine);
router.post('/VerificationScan', VerificationScan);
router.post("/SaveTransaksi",SaveTransaksi);
router.post('/SaveTransaksiCollection', SaveTransaksi)
router.post('/UpdateBinWeight',UpdateBinWeight)
router.post('/UpdateBinWeightCollection',UpdateBinWeightCollection)
router.post('/CheckBinCapacity',CheckBinCapacity)
router.post('/UpdateDataFromStep2',UpdateDataFromStep2)
router.post('/UpdateLineContainer',UpdateLineContainer)
router.get('/getTransactionList',getTransactionList)
router.post('/UpdateStatus',UpdateStatus);
router.post('/Getidscarplog',getIdscaplog);
router.post('/Getidmachine',getIdmachine);
router.put("/step1/:idscraplog",UpdateTransaksi);
router.get("/CekTransaksi",checkTransaksi);
router.get('/sync/:hostname',syncTransaction);
router.delete('/CancelTransaksi/:id',DeleteTransaksi);
export default router;
