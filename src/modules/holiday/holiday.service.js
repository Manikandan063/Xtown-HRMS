import { Op } from "sequelize";
import { Holiday } from "../../models/initModels.js";

export const getAllHolidays = async (companyId) => {
    return await Holiday.findAll({
        where: { companyId },
        order: [['holidayDate', 'ASC']]
    });
};

export const createHoliday = async (data) => {
    return await Holiday.create(data);
};

export const updateHoliday = async (id, companyId, data) => {
    return await Holiday.update(data, {
        where: { id, companyId }
    });
};

export const deleteHoliday = async (id, companyId) => {
    return await Holiday.destroy({
        where: { id, companyId }
    });
};

export const populateDefaultHolidays = async (companyId, year) => {
    // Clear existing calculated Saturday holidays to prevent duplicates after fixing the drift bug
    await Holiday.destroy({
        where: {
            companyId,
            holidayName: { [Op.like]: "%Saturday (Office Leave)%" },
            holidayDate: {
                [Op.between]: [`${year}-01-01`, `${year}-12-31`]
            }
        }
    });

    const holidays = [];

    // 1. Logic for 2nd and 4th Saturdays
    for (let month = 0; month < 12; month++) {
        let saturdays = [];
        let date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            if (date.getDay() === 6) { // Saturday
                saturdays.push(new Date(date));
            }
            date.setDate(date.getDate() + 1);
        }
        
        // Internal helper to format date as YYYY-MM-DD without UTC conversion shift
        const toLocalDateString = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Add 2nd Saturday
        if (saturdays[1]) {
            holidays.push({
                companyId,
                holidayName: "2nd Saturday (Office Leave)",
                holidayDate: toLocalDateString(saturdays[1]),
                description: "Standard Monthly Recess"
            });
        }
        // Add 4th Saturday
        if (saturdays[3]) {
            holidays.push({
                companyId,
                holidayName: "4th Saturday (Office Leave)",
                holidayDate: toLocalDateString(saturdays[3]),
                description: "Standard Monthly Recess"
            });
        }
    }

    // 2. Standard Govt Holidays (India & Tamil Nadu)
    const govtHolidays = [
        { name: "New Year's Day", date: `${year}-01-01` },
        { name: "Pongal", date: `${year}-01-15` },
        { name: "Thiruvalluvar Day", date: `${year}-01-16` },
        { name: "Uzhavar Thirunal", date: `${year}-01-17` },
        { name: "Republic Day", date: `${year}-01-26` },
        { name: "Tamil New Year / Dr. Ambedkar Bday", date: `${year}-04-14` },
        { name: "May Day", date: `${year}-05-01` },
        { name: "Independence Day", date: `${year}-08-15` },
        { name: "Gandhi Jayanti", date: `${year}-10-02` },
        { name: "Christmas Day", date: `${year}-12-25` },
    ];

    govtHolidays.forEach(h => {
        holidays.push({
            companyId,
            holidayName: h.name,
            holidayDate: h.date,
            description: "Gazetted Holiday"
        });
    });

    // Create all
    return await Holiday.bulkCreate(holidays, { ignoreDuplicates: true });
};
