import { db } from '../src/models/initModels.js';
const { AttendanceDaily, sequelize } = db;
import { Op } from 'sequelize';

async function cleanup() {
  try {
    console.log("🔍 Checking for duplicates...");
    const [duplicates] = await sequelize.query(`
      SELECT "employeeId", "date", COUNT(*) 
      FROM attendance_daily 
      GROUP BY "employeeId", "date" 
      HAVING COUNT(*) > 1
    `);

    console.log(`Found ${duplicates.length} duplicate groups.`);

    for (const dup of duplicates) {
      console.log(`Cleaning up: Employee ${dup.employeeId} on ${dup.date}`);
      
      // Get all IDs for this pair
      const records = await AttendanceDaily.findAll({
        where: {
          employeeId: dup.employeeId,
          date: dup.date
        },
        order: [['updatedAt', 'DESC']]
      });

      // Keep the most recently updated one, delete the rest
      const idsToDelete = records.slice(1).map(r => r.id);
      
      if (idsToDelete.length > 0) {
        await AttendanceDaily.destroy({
          where: {
            id: { [Op.in]: idsToDelete }
          }
        });
        console.log(`Deleted ${idsToDelete.length} duplicates.`);
      }
    }

    console.log("🚀 Attempting to sync with unique constraint...");
    await AttendanceDaily.sync({ alter: true });
    console.log("✅ Success!");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    process.exit(0);
  }
}

cleanup();
