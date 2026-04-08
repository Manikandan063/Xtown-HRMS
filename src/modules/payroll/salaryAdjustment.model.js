import { sequelize } from "../../config/db.js";

export const createSalaryAdjustmentTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS salary_adjustments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('increment', 'decrement')),
        amount DECIMAL(15, 2) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    await sequelize.query(query);
};

export const addAdjustment = async (data) => {
    const { employee_id, type, amount, reason } = data;
    const query = `
        INSERT INTO salary_adjustments (employee_id, type, amount, reason)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const [res] = await sequelize.query(query, { bind: [employee_id, type, amount, reason] });
    return res[0];
};

export const getAdjustmentsByEmployee = async (employeeId) => {
    const query = `SELECT * FROM salary_adjustments WHERE employee_id = $1`;
    const [res] = await sequelize.query(query, { bind: [employeeId] });
    return res;
};
