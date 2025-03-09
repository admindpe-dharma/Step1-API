import Users from "../models/EmployeeModel.js";
import Container from "../models/ContainerModel.js";
import Waste from "../models/WasteModel.js";
import Bin from "../models/BinModel.js";
import transaction from "../models/TransactionModel.js";
import moment from "moment";
import employee from "../models/EmployeeModel.js";
import container from "../models/ContainerModel.js";
import bin from "../models/BinModel.js";
import { employeeSyncQueue, io, pendingSyncQueue } from "../index.js";
import { response } from "express";
import axios from "axios";
import { Op, QueryTypes } from "sequelize";
import waste from "../models/WasteModel.js";
import db from "../config/db.js";
//import { updateBinWeightData } from "./Bin.js";

const apiClient = axios.create({
  proxy: process.env.PROXY ? {
    protocol: "http",
    host: "10.77.8.70",
    port: 8080,
  } : undefined,
  timeout: 1500,
});
const syncApiClient = axios.create({
  proxy: process.env.PROXY ? {
    protocol: "http",
    host: "10.77.8.70",
    port: 8080,
  } : undefined,
  timeout: 1500,
});
syncApiClient.interceptors.response.use(
  (res) => res,
  (err) => err
);
export const ScanBadgeid = async (req, res) => {
  const { badgeId } = req.body;
  try {
    employeeSyncQueue.add({id:1});
    const user = await Users.findOne({
      attributes: ["badgeId", "username"],
      where: { badgeId },
    });
    if (user) {
      res.json({ user: user });
    } else {
      res.json({ error: "Badge ID not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

export const ScanContainer = async (req, res) => {
  const { containerId } = req.body;
  try {
    const container = await Container.findOne({
      attributes: [
        "containerId",
        "name",
        "station",
        "weightbin",
        "IdWaste",
        "type",
        "line",
        "hostname",
      ],
      include: [
        {
          model: Waste,
          as: "waste",
          required: true,
          duplicating: true,
          foreignKey: "IdWaste",
          attributes: ["name", "scales"],
          include: [
            {
              model: Bin,
              as: "bin",
              foreignKey: "name",
              attributes: ["name", "id", "IdWaste", "name_hostname", "weight"],
              required: false,
            },
          ],
        },
      ],
      where: { name: containerId },
    });
    if (container) {
      
    const tr = await transaction.findOne({
      where: {
        idContainer: container.containerId,
        status: "Waiting Dispose To Step 2",
      },
    });
    if (tr) return res.status(409).json({ error: "Bin sudah digunakan, transaksi tidak disimpan" });
      res.json({ container: container });
    } else {
      res.json({ error: "Container ID not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

export const ScanMachine = async (req, res) => {
  const { machineId } = req.body;
  try {
    const machine = await Bin.findOne({
      attributes: ["id", "name", "IdWaste", "line"],
      include: [
        {
          model: Waste,
          as: "waste",
          required: true,
          duplicating: true,
          foreignKey: "IdWaste",
          attributes: ["name"],
        },
        {
          model: Container,
          as: "container",
          required: true,
          duplicating: true,
          foreignKey: "id",
          attributes: ["name", "containerid", "line"],
        },
      ],
      where: { name: machineId },
    });

    if (machine) {
      res.json({ machine: machine });
    } else {
      res.json({ error: "bin ID not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};
export const syncPendingTransaction = async () => {
  const pendingData = await db.query(
    "Select t.Id,t.badgeId,c.name as containerName,c.hostname,w.name as wasteName,status,bin_qr,idscraplog,bin from transaction t inner join container c on t.idContainer=c.containerId inner join waste w on w.Id=t.IdWaste where t.status like '%PENDING%';",
    { type: QueryTypes.SELECT }
  );
  if (pendingData.length < 1) return pendingData;
  for (let i = 0; i < pendingData.length; i++) {
    const error = pendingData[i].status.split("|");
    error.splice(0, 1);
    const errorLoop = [...error];
    for (let j = 0; j < errorLoop.length; j++) {
      if (errorLoop[j] == "PIDSG") {
        const stationname = pendingData[i].containerName
          .split("-")
          .slice(0, 3)
          .join("-");
        const result = await syncApiClient.post(
          `http://${process.env.PIDSG}/api/pid/step1`,
          {
            badgeno: pendingData[i].badgeId,
            logindate: "",
            stationname: stationname,
            frombinname: pendingData[i].bin_qr,
            tobinname: pendingData[i].containerName,
            weight: "0",
            activity: "Waiting Dispose To Step 2",
          },
          {
            validateStatus: (status) => true,
            timeout: 1000,
            withCredentials: false,
          }
        );
        console.log(result);
        if (
          result.status &&
          result.status == 200 &&
          result.data.result &&
          result.data.result != "Fail" &&
          result.data.result != null
        ) {
          const index = error.indexOf("PIDSG");
          if (index > -1) {
            error.splice(index, 1);
            pendingData[i].idscraplog = result.data.result;
          }
        }
        else
          continue;
      } else if (
        errorLoop[j] == "STEP2" &&
        !error.includes("PIDSG") &&
        pendingData[i].idscraplog &&
        pendingData[i].idscraplog != "Fail" &&
        pendingData[i].idscraplog != ""
      ) {
        try
        {
          const resStep2 = await syncApiClient.post(
            `http://${pendingData[i].hostname}/Step1`,
            {
              idscraplog: pendingData[i].idscraplog,
              waste: pendingData[i].wasteName,
              container: pendingData[i].containerName,
              badgeId: pendingData[i].badgeId,
              toBin: pendingData[i].bin,
            },
            {
              timeout: 2000,
              withCredentials: false,
              validateStatus: (status) => true,
            }
          );
          if (resStep2.status && resStep2.status == 200) {
            const index = error.indexOf("STEP2");
            error.splice(index, 1);
          }
        }
        catch (er)
        {
          console.log(er);
        }
      }
    }
    const newStatus =
      error.length > 0 ? ["PENDING", ...error] : ["Waiting Dispose To Step 2"];
    pendingData[i].status = newStatus.join("|");
    await db.query(
      "Update Transaction set status=:newStatus,idscraplog=:idscraplog where id=:id",
      {
        type: QueryTypes.UPDATE,
        replacements: {
          newStatus: newStatus.join("|"),
          id: pendingData[i].Id,
          idscraplog: pendingData[i].idscraplog,
        },
      }
    );
  }
  return pendingData;
};
export const syncTransaction = async (req, res) => {
  try {
    const dataTransaction = await transaction.findAll({
      include: [
        {
          model: container,
          as: "container",
          required: true,
          foreignKey: "idContainer",
          where: {
            station: {
              [Op.like]: "%" + req.params.hostname + "%",
            },
          },
        },
        {
          model: waste,
          as: "waste",
          foreignKey: "IdWaste",
          required: true,
        },
      ],
      where: {
        status: "Waiting Dispose To Step 2",
        idscraplog: {
          [Op.ne]: "Fail",
        },
      },
    });
    return res.status(200).json(dataTransaction ?? []);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
export const getTransactionList = async (req, res) => {
  try {
    let response = await transaction.findAll({
      attributes: [
        "id",
        "badgeId",
        "idContainer",
        "idWaste",
        "createdAt",
        "status",
        "bin_qr",
      ],
      include: [
        {
          model: Waste,
          as: "waste",
          required: true,
          duplicating: true,
          foreignKey: "IdWaste",
          attributes: ["name"],
        },
        {
          model: Container,
          as: "container",
          required: true,
          duplicating: true,
          foreignKey: "idContainer",
          attributes: ["name", "line"],
        },
        {
          model: employee,
          as: "employee",
          required: true,
          duplicating: true,
          foreignKey: "badgeId",
          attributes: ["username"],
        },
      ],
      order: [["createdAt", "DESC"]],
      where: {
        idscraplog: {
          [Op.ne]: "Fail",
        },
      },
    });
    // Format createdAt to 'yyyy-mm-dd'
    response = response.map((transaction) => {
      return {
        ...transaction.dataValues,
        status: transaction.dataValues.status.includes("PENDING")
          ? "PENDING"
          : transaction.dataValues.status,
        createdAt: moment(transaction.createdAt).format("DD-MM-YYYY HH:mm:ss"),
      };
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const VerificationScan = async (req, res) => {
  const { binName } = req.body;
  try {
    const bin = await Bin.findOne({
      attributes: ["name"],
      where: { name: binName },
    });

    if (bin) {
      res.json({ bin: bin });
    } else {
      res.json({ error: "Container ID not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

export const CheckBinCapacity = async (req, res) => {
  const { IdWaste, neto } = req.body;
  try {
    // Mengambil semua tempat sampah yang sesuai dengan type_waste dari database
    const bins = await Bin.findAll({
      where: {
        IdWaste: IdWaste,
      },
    });

    // Jika tidak ada tempat sampah yang ditemukan untuk type_waste yang diberikan
    if (!bins || bins.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bins found for the given waste type",
      });
    }

    // Menyaring tempat sampah yang memiliki kapasitas cukup untuk neto
    let eligibleBins = bins.filter(
      (bin) =>
        parseFloat(bin.weight) + parseFloat(neto) <= parseFloat(bin.max_weight)
    );

    // Jika tidak ada tempat sampah yang memenuhi kapasitas
    if (eligibleBins.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No bins with enough capacity found",
      });
    }

    // Mengurutkan tempat sampah berdasarkan kapasitas yang paling kosong terlebih dahulu
    eligibleBins = eligibleBins.sort(
      (a, b) => parseFloat(a.weight) - parseFloat(b.weight)
    );

    // Memilih tempat sampah yang paling kosong
    let selectedBin = eligibleBins[0];

    res.status(200).json({ success: true, bin: selectedBin });
  } catch (error) {
    console.log("Error checking bin capacity:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
export const checkTransaksi = async (req, res) => {
  const { idContainer, bin_qr, bin } = req.query;

  const tr = await transaction.findOne({
    where: {
      idContainer: idContainer,
      [Op.or]: [
        {
          status: "Waiting Dispose To Step 2",
        },
        { status: { [Op.like]: "%PENDING%" } },
      ],
    },
  });
  return tr
    ? res.status(409).json({ msg: "Transaction Already Registered" })
    : res.status(200).json({ msg: "OK" });
};
export const SaveTransaksi = async (req, res) => {
  const { payload } = req.body;
  const error = [];
  //payload.recordDate = moment().format("YYYY-MM-DD HH:mm:ss");
  pendingSyncQueue.add({id:2});
  const _waste = await Waste.findOne({
    where: {
      id: payload.IdWaste,
    },
  });
  const _container = await Container.findOne({
    where: {
      containerId: payload.idContainer,
    },
  });
  const tr = await transaction.findOne({
    where: {
      idContainer: payload.idContainer,
      [Op.or] : [
        {
      status: "Waiting Dispose To Step 2"},
      {
        status: {[Op.like] : '%PENDING%'}
      }
      ]
    },
  });
  if (tr)
    return res.status(409).json({ msg: "Transaction Already Registered" });
  try {
    
    let stationname = _container.name.split("-").slice(0, 3).join("-");
    try
    {
    const response = await apiClient.post(
      `http://${process.env.PIDSG}/api/pid/step1`,
      {
        badgeno: payload.badgeId,
        logindate: "",
        stationname: stationname,
        frombinname: payload.bin,
        tobinname: _container.name,
        weight: "0",
        activity: "Waiting Dispose To Step 2",
      }
    );
    if (response.status && (response.status != 200 || (response.data && response.data.status && response.data.status == "Fail" ))) 
    {
      error.push('PIDSG');
    }
    else
      payload.idscraplog = response.data.result;
    }
    catch (er)
    {
      error.push('PIDSG');
    } 
    if (error.length == 0) {
      try
      {
        const _res = await apiClient.post(
          `http://${_container.hostname}/Step1`,
          {
            idscraplog: payload.idscraplog,
            waste: _waste.name,
            container: _container.name,
            badgeId: payload.badgeId,
            toBin: payload.bin,
          },
          {
            validateStatus: (status) => true,
          }
        );
        
        if (_res.status >= 300) error.push("STEP2");
      }
      catch
      {
        error.push("STEP2");
      }
    } else error.push("STEP2");
    if (error && error.length > 0)
      payload.status = ["PENDING", ...error].join("|");
    else
      payload.status = 'Waiting Dispose To Step 2';
    const latest = await transaction.create(payload);
    await latest.save();
    return res
      .status(200)
      .json({ Id: latest.dataValues.Id ?? latest.dataValues.id });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.response | err });
  }
};
export const DeleteTransaksi = async (req, res) => {
  const { id } = req.params.id;
  const dataTransaction = await transaction.findOne({
    where: {
      Id: id,
    },
  });
  if (!dataTransaction)
    return res.status(201).json({ msg: "Data Not Found, No Issue" });
  dataTransaction.destroy();
  return res.status(200).json({ msg: "ok" });
};
export const UpdateTransaksi = async (req, res) => {
  const { idscraplog, logindate } = req.params;
  const { status } = req.body;
  const _transaction = await transaction.findOne({
    where: {
      idscraplog: idscraplog,
    },
  });
  if (!_transaction) return res.json({ msg: "Transaction Not Found" }, 404);
  try {
    await apiClient.put(
      `http://${process.env.PIDSG}/api/pid/step1/` + idscraplog,
      { status: "Done", logindate: logindate }
    );
    _transaction.setDataValue("status", status);
    //_transaction.setDataValue("neto",neto);
    await _transaction.save();
    return res.json({ msg: "Ok" }, 200);
  } catch (err) {
    return res.json({ error: err.response ? err.response.data : err }, 500);
  }
};
/*export const SaveTransaksiCollection = async (req, res) => {
    const { payload } = req.body;
    payload.recordDate = moment().format("YYYY-MM-DD HH:mm:ss");
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
  res.status(200).json({ msg: "ok" });
};

export const UpdateBinWeightCollection = async (req, res) => {
  const { binId } = req.body; // neto is not needed as weight will be set to 0
  const data = await Bin.findOne({ where: { id: binId } });

  if (data) {
    data.weight = 0; // Set weight to 0
    await data.save();
    // await updateBinWeightData(data.name_hostname);
    res.status(200).json({ msg: "ok" });
  } else {
    res.status(404).json({ msg: "Bin not found" });
  }
};

export const UpdateDataFromStep2 = async (req, res) => {
  try {
    const { idContainer, status } = req.body;
    if (!idContainer || !status) {
      return res.status(400).json({ msg: "Name dan status harus disertakan" });
    }

    const existingContainer = await transaction.findOne({
      where: {
        idContainer: idContainer,
      },
    });

    if (!existingContainer) {
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    }

    await transaction.update(
      { status: status },
      {
        where: {
          idContainer: idContainer,
        },
      }
    );

    res.status(200).json({ msg: "Status berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const UpdateLineContainer = async (req, res) => {
  try {
    const { name, line } = req.body;
    if (!name || !line) {
      return res.status(400).json({ msg: "Name dan status harus disertakan" });
    }

    const existingContainer = await container.findOne({
      where: {
        name: name,
      },
    });

    if (!existingContainer) {
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    }

    await container.update(
      { line: line },
      {
        where: {
          name: name,
        },
      }
    );

    res.status(200).json({ msg: "line berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const UpdateStatus = async (req, res) => {
  const { containerName, status, binQr } = req.body;
  const data = await Container.findOne({
    where: {
      name: containerName,
    },
  });
  await transaction.update(
    { status: status },
    {
      where: {
        idContainer: data.containerId,
      },
    }
  );
  io.emit("UpdateStep1");
  res.status(200).json({ msg: "ok" });
};

export const getIdscaplog = async (req, res) => {
  try {
    const { status, idContainer } = req.body;

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
        idContainer: idContainer,
      },
      attributes: ["idscraplog"], // specify the attributes to fetch
    });

    if (!transactionRecord) {
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    }

    res.status(200).json({ msg: "get data berhasil", data: transactionRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getIdmachine = async (req, res) => {
  try {
    const { status, idContainer } = req.body;

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
        idContainer: idContainer,
      },
      attributes: ["bin"], // specify the attributes to fetch
    });

    if (!transactionRecord) {
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    }

    res.status(200).json({ msg: "get data berhasil", data: transactionRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const syncAll = async (req,res)=>{
  
  await syncPendingTransaction();
  await syncEmployeePIDSG();
  return res.json({msg:"ok"},200);
}



export const syncEmployeePIDSGAPI = async (req,res)=>{
    return res.json(await syncEmployeePIDSG());
}

export const syncEmployeePIDSG = async ()=>{
    let apiRes = null;
    try
    {
        apiRes = await syncApiClient.get(
            `http://${process.env.PIDSG}/api/pid/employee-sync?f1=${process.env.STATION}`);
        const syncEmp = apiRes.data.result[0];
        for (let i=0;i<syncEmp.length;i++)
        {
            const empRes = await db.query("Select badgeId,username from employee where badgeId=?",{type:QueryTypes.SELECT,replacements:[syncEmp[i].badgeno]});
            if (empRes.length < 1)
            {
                await db.query("Insert Into employee(username,active,badgeId) values(?,1,?)",
                {
                    type:QueryTypes.INSERT,
                    replacements: [syncEmp[i].employeename,syncEmp[i].badgeno]
                });
            }
            else
            {
                await db.query("Update employee set username=? where badgeId=?",{
                    type: QueryTypes.UPDATE,
                    replacements: [syncEmp[i].employeename,syncEmp[i].badgeno]
                })
            }
        }
        return syncEmp;
    }
    catch (er)
    {
        console.log(er);
        return  {msg: er.message || er,res:apiRes};
    }
}

/*router.get('/employee-sync',async (req,res)=>{
  try {
    const pool = await poolPromise;
    let result = await pool.request().input('f1',`${req.query.f1}%`).query(`
    select s.name,e.employeename,e.badgeno,sum(case when event='IN' then 1 else 0 end) as [IN],sum(case when event='OUT' then 1 else 0 end) as [OUT] from pid_mwastestationaccess ac inner join pid_mwastestation s on ac.pid_mwastestation_key=s.pid_mwastestation_key inner join pid_memployee e on e.pid_memployee_key=ac.pid_memployee_key 
    where s.name like @f1
    group by s.name,e.employeename,e.badgeno
    order by s.name,e.badgeno
    `);
    res.status(200).json({
      success: true,
      result: result.recordsets
    });

    // res.json(req.params.sp)
  } catch (err) {
    res.status(500).json({
      success: false,
      response: err.message
    });
  }
});*/