import Client from "../models/client.model.js";
import { errorHandler } from "../utils/error.js";


export const createClient = async (req, res, next) => {
  try {
    const {
      clientName,
      businessType,
      pan,
      aadhaar,
      gst,
      email,
      mobile,
      address,
      contactPerson,
      natureOfBusiness
    } = req.body;

    const documents = req.files?.map(
      file => `${req.protocol}://${req.get("host")}/uploads/documents/${file.filename}`
    ) || [];

    const newClient = await Client.create({
      clientName,
      businessType,
      pan,
      aadhaar,
      gst,
      email,
      mobile,
      address,
      contactPerson,
      natureOfBusiness,
      documents,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, message: "Client created", client: newClient });
  } catch (error) {
    next(error);
  }
};

// ✏ Update Client
export const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return next(errorHandler(404, "Client not found"));

    let documents = [...client.documents];
    if (req.files?.length > 0) {
      const newDocs = req.files.map(
        file => `${req.protocol}://${req.get("host")}/uploads/documents/${file.filename}`
      );
      documents = [...documents, ...newDocs];
    }

    Object.assign(client, {
      ...req.body,
      documents
    });

    await client.save();
    res.status(200).json({ success: true, message: "Client updated", client });
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.find({ createdBy:id});
    if (!client) return next(errorHandler(404, "Client not found"));

    res.status(200).json({ success: true, client });
  } catch (error) {
    next(error);
  }
};


// 📄 Get All Clients
export const getAllClients = async (req, res, next) => {
  try {
    const clients = await Client.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, clients });
  } catch (error) {
    next(error);
  }
};

// 📊 Client Dashboard Data
export const getClientDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalClients = await Client.countDocuments({ createdBy: userId });
    const individual = await Client.countDocuments({ createdBy: userId, businessType: "Individual" });
    const firm = await Client.countDocuments({ createdBy: userId, businessType: "Firm" });
    const company = await Client.countDocuments({ createdBy: userId, businessType: "Company" });

    const recentClients = await Client.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("clientName businessType pan createdAt");

    res.status(200).json({
      success: true,
      stats: { totalClients, individual, firm, company },
      recentClients
    });
  } catch (error) {
    next(error);
  }
};
