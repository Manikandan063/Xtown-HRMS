import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log(`[EMAIL_DEBUG] Using User: ${process.env.EMAIL_USER}`);
console.log(`[EMAIL_DEBUG] Using Pass: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) + "****" : "MISSING"}`);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

import fs from "fs";
import path from "path";

export const sendEmail = async (to, subject, text, html, attachments = [], fromName = "XTown HRMS") => {
    try {
        console.log(`[EMAIL_SERVICE] Attempting delivery to: ${to} (Attachments: ${attachments.length})`);
        const info = await transporter.sendMail({
            from: `"${fromName}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
            attachments,
        });
        console.log(`[EMAIL_SERVICE] ✅ SUCCESS! MessageID: ${info.messageId}`);
        return info;
    } catch (error) {
        const errorMsg = `[${new Date().toISOString()}] FAILED to ${to}: ${error.message}\n`;
        fs.appendFileSync(path.join(process.cwd(), "logs/email-errors.log"), errorMsg);
        
        console.error(`[EMAIL_SERVICE] ❌ FAILED delivery to ${to}`);
        console.error(`[EMAIL_SERVICE] Error details:`, error.message);
        throw error;
    }
};
