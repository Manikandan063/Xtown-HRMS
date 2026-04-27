import { db, initModels } from '../src/models/initModels.js';

async function checkDuplicate() {
  try {
    await initModels();
    const { Employee } = db;
    
    // Look for everything related to arun
    const results = await Employee.findAll({
      where: {
        [db.sequelize.Sequelize.Op.or]: [
          { officialEmail: 'arun@gmail.com' },
          { employeeCode: 'EMP001' }
        ]
      },
      include: ['personalDetail']
    });

    console.log(`--- FOUND ${results.length} RECORDS ---`);
    results.forEach(emp => {
      console.log(`ID: ${emp.id} | Code: ${emp.employeeCode} | Email: ${emp.officialEmail} | HasDOB: ${!!emp.personalDetail?.dateOfBirth}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkDuplicate();
