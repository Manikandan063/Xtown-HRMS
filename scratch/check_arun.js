import { db, initModels } from '../src/models/initModels.js';
import bcrypt from 'bcryptjs';

async function fixArun() {
  try {
    // 1. Initialize associations
    await initModels();
    const { User, Employee, EmployeePersonalDetail } = db;
  
    // 2. Find arun
    const arun = await Employee.findOne({
      where: {
        firstName: { [db.sequelize.Sequelize.Op.like]: '%arun%' }
      },
      include: ['personalDetail']
    });
  
    if (!arun) {
      console.log('❌ Employee "arun" not found');
      process.exit(0);
    }
  
    console.log(`✅ Found: ${arun.firstName} ${arun.lastName} (${arun.officialEmail})`);
    
    const dob = arun.personalDetail?.dateOfBirth;
    if (!dob) {
      console.log('❌ DOB not found for "arun". Update personal details in UI first.');
      process.exit(0);
    }

    // Format DOB: DD-MM-YYYY
    const [year, month, day] = dob.split('-');
    const formattedDOB = `${day}-${month}-${year}`;
    console.log(`🎯 Targeted DOB Password: ${formattedDOB}`);

    // 3. Find if there's a record in Users table
    const userRecord = await User.findOne({
      where: { email: arun.officialEmail }
    });

    if (userRecord) {
      console.log(`🔄 Found User record. Updating password to DOB hash...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(formattedDOB, salt);
      
      await userRecord.update({ password: hashedPassword });
      console.log('✅ User record updated successfully.');
    } else {
      console.log('ℹ️ No User record exists. Fallback to DOB login (Direct) is already active.');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

fixArun();
