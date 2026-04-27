import { db } from '../src/models/initModels.js';
import bcrypt from 'bcryptjs';

async function quickFixArun() {
  try {
    const { User, Employee, EmployeePersonalDetail } = db;
    
    // Manual association just for this query to avoid slow sync
    Employee.hasOne(EmployeePersonalDetail, { foreignKey: 'employeeId', as: 'personalDetail' });

    const arun = await Employee.findOne({
      where: {
        officialEmail: 'arun@gmail.com'
      },
      include: [{ model: EmployeePersonalDetail, as: 'personalDetail' }]
    });

    if (!arun) {
      console.log('❌ Employee "arun" not found');
    } else {
      console.log(`✅ Found: ${arun.firstName} ${arun.lastName} | ID: ${arun.employeeCode}`);
      const dob = arun.personalDetail?.dateOfBirth;
      if (dob) {
        const [year, month, day] = dob.split('-');
        const formattedDOB = `${day}-${month}-${year}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(formattedDOB, salt);
        
        // Update both if exists
        const user = await User.findOne({ where: { email: arun.officialEmail } });
        if (user) {
          await user.update({ password: hashedPassword });
          console.log(`✅ User table updated with DOB password: ${formattedDOB}`);
        } else {
          console.log(`ℹ️ No User record. Fallback is already active for email: ${arun.officialEmail}`);
        }
      } else {
        console.log('❌ DOB missing in record.');
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

quickFixArun();
