import { SupportMessage, User, SupportTicket, ChatMessage, Role, Company } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";
import { Op } from "sequelize";

const BOT_NAME = "XTOWN Bot";

const BOT_RESPONSES = [
  { keywords: ["login", "password", "sign in"], response: "To reset your password, go to the Login page and click 'Forgot Password'. Follow the instructions sent to your email." },
  { keywords: ["attendance", "clock", "selfie"], response: "You can mark your attendance using the 'Selfie Attendance' button on your dashboard. Ensure your camera permissions are enabled." },
  { keywords: ["leave", "holiday", "vacation"], response: "To apply for leave, navigate to the 'Leave' module and click 'Request Leave'. Your manager will review it." },
  { keywords: ["profile", "image", "photo"], response: "You can update your profile image in the 'Profile' section. Click on the camera icon to upload a new one." },
  { keywords: ["resignation", "resign", "quit"], response: "Resignations can be requested from the Profile page. Once submitted, HR will contact you for the exit process." },
  { keywords: ["hi", "hello", "hey"], response: "Hello! I am the XTOWN Support Bot. How can I assist you today? You can ask about attendance, leave, profile, or technical issues." },
];

export const supportController = {
  sendMessage: async (req, res, next) => {
    try {
      const { message } = req.body;
      const senderId = req.user.userId;
      const companyId = req.user.companyId;

      // 1. Save user message
      const userMsg = await SupportMessage.create({
        senderId,
        companyId,
        message,
        type: "user"
      });

      // 2. ChatBot Logic
      let botResponse = null;
      let showEscalate = false;
      const lowerMsg = message.toLowerCase();
      
      const matched = BOT_RESPONSES.find(item => 
        item.keywords.some(keyword => lowerMsg.includes(keyword))
      );

      if (matched) {
        botResponse = matched.response;
      } else {
        // If no match, suggest escalation
        botResponse = "I'm sorry, I couldn't find a direct answer for that. Would you like to escalate this issue to our SuperAdmin support team?";
        showEscalate = true;
      }

      // 3. Save bot response
      const botMsg = await SupportMessage.create({
        senderId: null, // System Bot
        receiverId: senderId,
        companyId,
        message: botResponse,
        type: "bot"
      });

      res.status(201).json({
        status: "success",
        data: {
          userMessage: userMsg,
          botResponse: botMsg,
          showEscalate
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getMessages: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const messages = await SupportMessage.findAll({
        where: {
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        order: [["createdAt", "ASC"]]
      });

      res.status(200).json({
        status: "success",
        data: messages
      });
    } catch (error) {
      next(error);
    }
  },

  // 🔹 TICKET ESCALATION logic
  escalateToTicket: async (req, res, next) => {
    try {
      const { issueTitle, issueDescription, category, priority } = req.body;
      const userId = req.user.userId;
      const companyId = req.user.companyId;

      // Generate Ticket ID (e.g. TICK-12345)
      const ticketId = `TICK-${Math.floor(10000 + Math.random() * 90000)}`;

      // Find an available SuperAdmin
      const superAdmin = await User.findOne({ 
        include: [{ 
          model: Role, 
          as: 'role', 
          where: { name: 'super_admin' } 
        }] 
      });

      const ticket = await SupportTicket.create({
        ticketId,
        userId,
        companyId,
        issueTitle,
        issueDescription,
        category,
        priority,
        status: "Open",
        assignedTo: superAdmin ? superAdmin.id : null
      });

      res.status(201).json({
        status: "success",
        message: "Your issue has been escalated to SuperAdmin. A support ticket has been created.",
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  },

  getMyTickets: async (req, res, next) => {
    try {
      const tickets = await SupportTicket.findAll({
        where: { userId: req.user.userId },
        order: [["createdAt", "DESC"]]
      });
      res.json({ status: "success", data: tickets });
    } catch (error) {
      next(error);
    }
  },

  getSuperAdminTickets: async (req, res, next) => {
    try {
      const isSuperAdmin = req.user.role === 'super_admin';
      if (!isSuperAdmin) {
        return next(new AppError("Unauthorized", 403));
      }
      const tickets = await SupportTicket.findAll({
        include: [
          { model: User, as: "user", attributes: ["name", "email"] },
          { model: Company, as: "companyInfo", attributes: ["companyName"] }
        ],
        order: [["createdAt", "DESC"]]
      });
      res.json({ status: "success", data: tickets });
    } catch (error) {
      next(error);
    }
  },

  getTicketMessages: async (req, res, next) => {
    try {
      const { ticketId } = req.params;
      const messages = await ChatMessage.findAll({
        where: { ticketId },
        include: [{ model: User, as: "sender", attributes: ["name", "email"] }],
        order: [["createdAt", "ASC"]]
      });
      res.json({ status: "success", data: messages });
    } catch (error) {
      next(error);
    }
  },

  updateTicketStatus: async (req, res, next) => {
    try {
      const { ticketId } = req.params;
      const { status } = req.body;
      const ticket = await SupportTicket.findByPk(ticketId);
      if (!ticket) return next(new AppError("Ticket not found", 404));
      
      await ticket.update({ status });
      res.json({ status: "success", message: "Ticket status updated", data: ticket });
    } catch (error) {
      next(error);
    }
  },

  uploadAttachment: async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError("No file uploaded", 400));
      }

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/support/${req.file.filename}`;
      const fileType = req.file.mimetype.startsWith("image/") ? "image" : "file";

      res.status(200).json({
        status: "success",
        data: {
          url: fileUrl,
          type: fileType,
          originalName: req.file.originalname
        }
      });
    } catch (error) {
      next(error);
    }
  },

  submitRating: async (req, res, next) => {
    try {
      const { ticketId } = req.params;
      const { rating, feedback } = req.body;
      const ticket = await SupportTicket.findByPk(ticketId);

      if (!ticket) return next(new AppError("Ticket not found", 404));
      if (ticket.status !== "Resolved") return next(new AppError("You can only rate resolved tickets", 400));
      if (ticket.userId !== req.user.userId) return next(new AppError("Not authorized to rate this ticket", 403));

      await ticket.update({ rating, ratingFeedback: feedback });
      res.json({ status: "success", message: "Thank you for your feedback!", data: ticket });
    } catch (error) {
      next(error);
    }
  }
};
