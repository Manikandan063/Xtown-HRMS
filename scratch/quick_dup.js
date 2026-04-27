import { db } from '../src/models/initModels.js';

async function quickDup() {
  try {
    const { Employee, EmployeePersonalDetail } = db;
    Employee.hasOne(EmployeePersonalDetail, { foreignKey: 'employeeId', as: 'personalDetail' });

    const results = await Employee.findAll({
      where: {
        [db.sequelize.Sequelize.Op.or]: [
          { officialEmail: 'arun@gmail.com' },
          { employeeCode: 'EMP001' }
        ]
      },
      include: [{ model: EmployeePersonalDetail, as: 'personalDetail' }]
    });

    console.log(`--- FOUND ${results.length} RECORDS ---`);
    results.forEach(emp => {
      console.log(`ID: ${emp.id} | Company: ${emp.companyId} | Code: ${emp.employeeCode} | Email: ${emp.officialEmail} | HasDOB: ${!!emp.personalDetail?.dateOfBirth}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

quickDup();
