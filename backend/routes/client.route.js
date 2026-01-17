import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import multer from "../utils/multer.js";
import {
  createClient,
  updateClient,
  getAllClients,
  getClientDashboardData,
  getClientById
} from "../controller/client.controller.js";

const router = express.Router();

router.post("/add-details", verifyToken, multer.array("documents", 10), createClient);
router.get("/details/:id", getClientById);
router.put("/:id", verifyToken, multer.array("documents", 10), updateClient);
router.get("/all", verifyToken, getAllClients);
router.get("/dashboard", verifyToken, getClientDashboardData);

export default router;
