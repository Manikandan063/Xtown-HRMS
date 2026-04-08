import { db, initModels } from './src/models/initModels.js';
import { connectDB } from './src/config/db.js';

const checkEmployee = async () => {
  await connectDB();
  await initModels();

  const employeeId = '5aee9691-6ae2-4257-a3cd-4046178b6c5d';
  
  const employee = await db.Employee.findByPk(employeeId);
  console.log('Employee Found:', employee ? 'YES' : 'NO');
  if (employee) {
    console.log('Name:', employee.firstName, employee.lastName);
  }

  const salary = await db.EmployeeSalary.findOne({ where: { employeeId } });
  console.log('Salary Structure Found:', salary ? 'YES' : 'NO');
  if (salary) {
    console.log('Salary Details:', salary.toJSON());
  }

  process.exit();
};

checkEmployee();
