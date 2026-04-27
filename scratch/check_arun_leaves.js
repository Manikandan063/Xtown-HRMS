import { db } from '../src/models/initModels.js';

async function checkArunLeaves() {
  try {
    const { LeaveBalance, LeaveType } = db;
    LeaveBalance.belongsTo(LeaveType, { foreignKey: 'leaveTypeId', as: 'leaveType' });

    const leaves = await LeaveBalance.findAll({
      where: { employeeId: '5aee9691-6ae2-4257-a3cd-4046178b6c5d' },
      include: [{ model: LeaveType, as: 'leaveType' }]
    });

    console.log(`--- ARUN LEAVE RECORDS ---`);
    leaves.forEach(l => {
      console.log(`Name: ${l.leaveType?.leaveName} | Balance: ${l.balance} | Used: ${l.used} | Year: ${l.year} | MaxPerYear: ${l.leaveType?.maxDaysPerYear}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkArunLeaves();
