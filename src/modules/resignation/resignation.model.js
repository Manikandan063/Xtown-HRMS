import { sequelize } from "../../config/db.js";

export const createResignationTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS resignations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        reason TEXT,
        notice_period INTEGER,
        last_working_date DATE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        final_settlement_amount DECIMAL(15, 2) DEFAULT 0.00,
        settlement_status VARCHAR(20) DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    await sequelize.query(query);
};
