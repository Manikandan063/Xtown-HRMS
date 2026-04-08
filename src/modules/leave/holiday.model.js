import { sequelize } from "../../config/db.js";

export const createHolidayTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS holidays (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL,
        holiday_name VARCHAR(100) NOT NULL,
        holiday_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    await sequelize.query(query);
};

export const addHoliday = async (data) => {
    const { company_id, holiday_name, holiday_date } = data;
    const query = `
        INSERT INTO holidays (company_id, holiday_name, holiday_date)
        VALUES ($1, $2, $3) RETURNING *;
    `;
    const [res] = await sequelize.query(query, { bind: [company_id, holiday_name, holiday_date] });
    return res[0];
};

export const getHolidays = async (companyId) => {
    const query = `SELECT * FROM holidays WHERE company_id = $1 ORDER BY holiday_date ASC`;
    const [res] = await sequelize.query(query, { bind: [companyId] });
    return res;
};
