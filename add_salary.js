import { db, initModels } from './src/models/initModels.js';
import { connectDB } from './src/config/db.js';

const addSalary = async () => {
  await connectDB();
  await initModels();

  const employeeId = '5aee9691-6ae2-4257-a3cd-4046178b6c5d';
  
    try {
      const salary = await db.EmployeeSalary.create({
        employeeId,
        basicSalary: 20000,
        hra: 5000,
        da: 2000,
        medicalAllowance: 1000,
        conveyance: 1500,
        deductions: 500,
        netSalary: 29000,
        effectiveFrom: new Date(),
        currency: "INR"
      });
    console.log('✅ Salary Structure Created!');
  } catch (err) {
    console.error('Error:', err);
  }

  process.exit();
};

addSalary();
