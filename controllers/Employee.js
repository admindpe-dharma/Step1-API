import Users from "../models/EmployeeModel.js"
import Container from "../models/ContainerModel.js";
import Waste from "../models/WasteModel.js";
import Bin from "../models/BinModel.js";
import transaction from "../models/TransactionModel.js"
import moment from 'moment';
import employee from "../models/EmployeeModel.js";
import container from "../models/ContainerModel.js";
import bin from "../models/BinModel.js";
import {io} from '../index.js';
import { response } from "express";
import axios from "axios";
//import { updateBinWeightData } from "./Bin.js";

const apiClient =  axios.create({
        proxy:{
            protocol:"http",
            host : "10.77.8.70",
            port:8080
        }
    });
export const ScanBadgeid = async (req, res) => {
    const { badgeId } = req.body;
    try {
        const user = await Users.findOne({ attributes: ['badgeId', "username"], where: { badgeId } });
        if (user) {
            res.json({ user: user });
        } else {
            res.json({ error: 'Badge ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
};

export const ScanContainer = async (req, res) => {
    const { containerId } = req.body;
    try {
        const container = await Container.findOne({
            attributes: ['containerId', 'name', 'station', 'weightbin', 'IdWaste', 'type', 'line'],
            include: [
                {
                    model: Waste,
                    as: 'waste',
                    required: true,
                    duplicating: true,
                    foreignKey: 'IdWaste',
                    attributes: ['name', 'scales'],
            include: [
                        {
                            model: Bin,
                            as: 'bin',
                            required: true,
                            duplicating: true,
                            foreignKey: 'name',
                            attributes: ['name', 'id', 'IdWaste', 'name_hostname', 'weight']
                        }
                    ]
                }
            ],
            where: { name: containerId }
        });

        if (container) {
            res.json({ container: container });
        } else {
            res.json({ error: 'Container ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
};

export const ScanMachine = async (req, res) => {
    const { machineId } = req.body;
    try {
        const machine = await Bin.findOne({
            attributes: ['id', 'name','IdWaste','line'],
            include: [{
                model: Waste,
                as: 'waste',
                required: true,
                duplicating: true,
                foreignKey: 'IdWaste',
                attributes: ['name'],
            },{
                    model: Container,
                    as: 'container',
                    required: true,
                    duplicating: true,
                    foreignKey: 'id',
                    attributes: ['name','containerid','line']
            },
        ],
            where: { name: machineId }
        });

        if (machine) {
            console.log(machine);
            res.json({ machine: machine });
        } else {
            res.json({ error: 'bin ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
};

export const getTransactionList = async (req, res) => {
    try {
        let response = await transaction.findAll({
            attributes: ['id', 'badgeId', 'idContainer', 'idWaste', 'createdAt', 'status','bin_qr'],
            include: [{
                model: Waste,
                as: 'waste',
                required: true,
                duplicating: true,
                foreignKey: 'IdWaste',
                attributes: ['name'],
            },{
                model: Container,
                as: 'container',
                required: true,
                duplicating: true,
                foreignKey: 'idContainer',
                attributes: ['name','line']
            },
            {
                model: employee,
                as: 'employee',
                required: true,
                duplicating: true,
                foreignKey: 'badgeId',
                attributes: ['username']
            }]
        });

        // Format createdAt to 'yyyy-mm-dd'
        response = response.map(transaction => {
            return {
                ...transaction.dataValues,
                createdAt: moment(transaction.createdAt).format('DD-MM-YYYY HH:mm:ss')
            };
        });

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const VerificationScan = async (req, res) => {
    const { binName } = req.body;
    try {
        const bin = await Bin.findOne({
            attributes: ['name'], where: { name: binName }
        });

        if (bin) {
            res.json({ bin: bin });
        } else {
            res.json({ error: 'Container ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
};

export const CheckBinCapacity = async (req, res) => {
    const { IdWaste, neto } = req.body;
    console.log(IdWaste);
    try {
        // Mengambil semua tempat sampah yang sesuai dengan type_waste dari database
        const bins = await Bin.findAll({
            where: {
                IdWaste: IdWaste
            }
        });

        // Jika tidak ada tempat sampah yang ditemukan untuk type_waste yang diberikan
        if (!bins || bins.length === 0) {
            return res.status(404).json({ success: false, message: 'No bins found for the given waste type' });
        }

        // Menyaring tempat sampah yang memiliki kapasitas cukup untuk neto
        let eligibleBins = bins.filter(bin => (parseFloat(bin.weight) + parseFloat(neto)) <= parseFloat(bin.max_weight));

        // Jika tidak ada tempat sampah yang memenuhi kapasitas
        if (eligibleBins.length === 0) {
            return res.status(200).json({ success: false, message: 'No bins with enough capacity found' });
        }

        // Mengurutkan tempat sampah berdasarkan kapasitas yang paling kosong terlebih dahulu
        eligibleBins = eligibleBins.sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight));

        // Memilih tempat sampah yang paling kosong
        let selectedBin = eligibleBins[0];

        res.status(200).json({ success: true, bin: selectedBin });
    } catch (error) {
        console.error('Error checking bin capacity:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const SaveTransaksi = async (req, res) => {
    const { payload } = req.body;
    //payload.recordDate = moment().format("YYYY-MM-DD HH:mm:ss");
    const _waste = await Waste.findOne({
        where: {
            id: payload.IdWaste,
        }
    });
    const _container = await Container.findOne({
        where:{
            containerId: payload.idContainer
        }
    });
    console.log([`${process.env.STEP_2_TIMBANGAN}`,payload]);
    try
    {
    const _res =await  apiClient.post(`http://${process.env.STEP_2_TIMBANGAN}/Step1`,{
        idscraplog: payload.idscraplog,
        waste: _waste.name,
        container: _container.name,
        badgeId: payload.badgeId,
        toBin: payload.bin
    });
    if (_res.status!=200)
        return res.status(500).json({msg:_res.data});
    (await transaction.create(payload)).save();
    return res.status(200).json({ msg: 'ok' });
    }
    catch (err)
    {
        console.log(err.response ? err.response.data : err);
        return res.status(500).json(err.response ? err.response.data : err);
    }
};
export const UpdateTransaksi = async (req,res)=>{
    const {idscraplog} = req.params;
    const {status} = req.body;
    const _transaction = await transaction.findOne({
        where:{
            idscraplog: idscraplog
        }
    });
    if (!_transaction)
        return res.json({msg:"Transaction Not Found"},404);
    try
    {
        await apiClient.put(`http://${process.env.PIDSG}/api/pid/step1/`+ idscraplog,{status:"Done"});
        _transaction.setDataValue("status",status);
        //_transaction.setDataValue("neto",neto);
        await _transaction.save();
        return res.json({msg:"Ok"},200);
    }
    catch (err)
    {
        return res.json({msg: err.response ? err.response.data :  err},500);
    }
}
/*export const SaveTransaksiCollection = async (req, res) => {
    const { payload } = req.body;
    payload.recordDate = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(payload);
    (await transaction.create(payload)).save();
    res.status(200).json({ msg: 'ok' });
};*/

export const UpdateBinWeight = async (req, res) => {
    const { binId, neto } = req.body;
    const data = await Bin.findOne({ where: { id: binId } });
    data.weight = parseFloat(neto) + parseFloat(data.weight);
    await data.save();

    //await updateBinWeightData(data.name_hostname);
    // await switchLamp(data.id,"RED",data.weight >= parseFloat(data.max_weight))
    res.status(200).json({ msg: 'ok' });
};

export const UpdateBinWeightCollection = async (req, res) => {
    const { binId } = req.body; // neto is not needed as weight will be set to 0
    const data = await Bin.findOne({ where: { id: binId } });

    if (data) {
        data.weight = 0; // Set weight to 0
        await data.save();
        // await updateBinWeightData(data.name_hostname);
        res.status(200).json({ msg: 'ok' });
    } else {
        res.status(404).json({ msg: 'Bin not found' });
    }
};

export const UpdateDataFromStep2 = async (req, res) => {
    try {
        const { idContainer, status } = req.body;
        console.log([idContainer, status]);
        if (!idContainer || !status) {
            return res.status(400).json({ msg: "Name dan status harus disertakan" });
        }

        const existingContainer = await transaction.findOne({
            where: {
                idContainer: idContainer
            }
        });


        if (!existingContainer) {
            return res.status(404).json({ msg: "Data tidak ditemukan" });
        }

        await transaction.update({ status: status }, {
            where: {
                idContainer: idContainer
            }
        });

        res.status(200).json({ msg: "Status berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const UpdateLineContainer = async (req, res) => {
    try {
        const { name, line } = req.body;
        //console.log([idContainer, status]);
        if (!name || !line) {
            return res.status(400).json({ msg: "Name dan status harus disertakan" });
        }

        const existingContainer = await container.findOne({
            where: {
                name: name
            }
        });


        if (!existingContainer) {
            return res.status(404).json({ msg: "Data tidak ditemukan" });
        }

        await container.update({ line: line }, {
            where: {
                name: name
            }
        });

        res.status(200).json({ msg: "line berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const UpdateStatus = async (req,res) => {
    const {containerName,status,binQr} = req.body;   
    console.log([containerName,status,binQr]);
    const data = await  Container.findOne(
        { where :{
            name:containerName
        }
    });
    console.log(data.containerId);
     await transaction.update({status:status},{
        where:{
            idContainer: data.containerId,
        }
    });
    io.emit("UpdateStep1");
    res.status(200).json({msg:'ok'});
};

export const getIdscaplog = async (req, res) => {
    try {
        const {status, idContainer } = req.body;
        
        // Validasi input
        if (!status) {
            return res.status(400).json({ msg: "status harus disertakan" });
        }
        if (!idContainer) {
            return res.status(400).json({ msg: "idContainer harus disertakan" });
        }

        // Query berdasarkan bin_qr, status, dan idContainer
        const transactionRecord = await transaction.findOne({
            where: {
                status: status,
                idContainer: idContainer
            },
            attributes: ['idscraplog']  // specify the attributes to fetch
        });

        if (!transactionRecord) {
            return res.status(404).json({ msg: "Data tidak ditemukan" });
        }

        res.status(200).json({ msg: "get data berhasil", data: transactionRecord });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getIdmachine = async (req, res) => {
    try {
        const {status, idContainer } = req.body;
        
        // Validasi input
        if (!status) {
            return res.status(400).json({ msg: "status harus disertakan" });
        }
        if (!idContainer) {
            return res.status(400).json({ msg: "idContainer harus disertakan" });
        }

        // Query berdasarkan bin_qr, status, dan idContainer
        const transactionRecord = await transaction.findOne({
            where: {
                status: status,
                idContainer: idContainer
            },
            attributes: ['bin']  // specify the attributes to fetch
        });

        if (!transactionRecord) {
            return res.status(404).json({ msg: "Data tidak ditemukan" });
        }

        res.status(200).json({ msg: "get data berhasil", data: transactionRecord });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};



