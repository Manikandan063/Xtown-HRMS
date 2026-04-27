import { db } from "../models/initModels.js";

const { SubscriptionPlan } = db;

export const seedSubscriptionPlans = async () => {
  try {
    const plans = [
      {
        name: "BASIC",
        price: 0,
        maxEmployees: 25,
        durationDays: 365,
        isActive: true,
        features: ["attendance", "leave", "profile"]
      },
      {
        name: "PREMIUM",
        price: 4999,
        maxEmployees: 350, // Updated to 350 as requested
        durationDays: 30,
        isActive: true,
        features: ["attendance", "leave", "payroll", "reports", "assets", "projects"]
      },
      {
        name: "ENTERPRISE",
        price: 15000,
        maxEmployees: 10000,
        durationDays: 365,
        isActive: true,
        features: ["attendance", "leave", "payroll", "reports", "assets", "projects", "analytics", "biometrics"]
      }
    ];

    for (const planData of plans) {
      const [plan, created] = await SubscriptionPlan.findOrCreate({
        where: { name: planData.name },
        defaults: planData
      });

      if (!created) {
        // If it exists, update the maxEmployees specifically for PREMIUM if needed
        if (planData.name === "PREMIUM" && plan.maxEmployees !== 350) {
          await plan.update({ maxEmployees: 350 });
          console.log(`✅ Updated PREMIUM plan employee limit to 350.`);
        }
      } else {
        console.log(`✅ Created ${planData.name} subscription plan.`);
      }
    }
  } catch (error) {
    console.error("❌ Failed to seed subscription plans:", error.message);
  }
};
