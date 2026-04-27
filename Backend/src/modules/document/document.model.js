import { sequelize } from "../../config/db.js";

export const createDocumentTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        document_type VARCHAR(50),
        file_url TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    await sequelize.query(query);
};

export const uploadDocument = async (data) => {
    const { employee_id, document_type, file_url } = data;
    const query = `
        INSERT INTO documents (employee_id, document_type, file_url)
        VALUES ($1, $2, $3) RETURNING *;
    `;
    const [res] = await sequelize.query(query, { bind: [employee_id, document_type, file_url] });
    return res[0];
};

export const getEmployeeDocuments = async (employeeId) => {
    const query = `SELECT * FROM documents WHERE employee_id = $1`;
    const [res] = await sequelize.query(query, { bind: [employeeId] });
    return res;
};
