import express from "express";
import { supportController } from "./support.controller.js";
import { uploadSupportFile } from "../../shared/utils/supportUpload.js";
import protect from "../../shared/middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.post("/send", supportController.sendMessage);
router.get("/my-messages", supportController.getMessages);

// 🔹 Tickets & Escalation
router.post("/escalate", supportController.escalateToTicket);
router.get("/my-tickets", supportController.getMyTickets);
router.get("/superadmin-tickets", supportController.getSuperAdminTickets);
router.get("/ticket/:ticketId/messages", supportController.getTicketMessages);
router.patch("/ticket/:ticketId/status", supportController.updateTicketStatus);
router.post("/ticket/:ticketId/rate", supportController.submitRating);
router.post("/upload-attachment", uploadSupportFile.single("file"), supportController.uploadAttachment);

export default router;
