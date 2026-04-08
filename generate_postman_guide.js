import PDFDocument from "pdfkit";
import fs from "fs";

const doc = new PDFDocument({ margin: 40 });
const output = fs.createWriteStream("complete_hrms_postman_guide.pdf");
doc.pipe(output);

// --- STYLING UTILS ---
const titleStyle = () => doc.fontSize(22).fillColor("#1A5276").font("Helvetica-Bold");
const subTitleStyle = () => doc.fontSize(16).fillColor("#1F618D").font("Helvetica-Bold");
const bodyLabelStyle = () => doc.fontSize(11).fillColor("#283747").font("Helvetica-Bold");
const jsonStyle = () => doc.fontSize(9).fillColor("#2E4053").font("Courier");
const methodStyle = (method) => {
    let color = "#000";
    if (method === "POST") color = "#28B463";
    if (method === "PUT" || method === "PATCH") color = "#F39C12";
    if (method === "DELETE") color = "#CB4335";
    return doc.fontSize(12).fillColor(color).font("Helvetica-Bold");
};

// --- PAGE 1: HEADER ---
titleStyle().text("XTOWN HRMS - COMPLETE API TESTING GUIDE", { align: "center" });
doc.fontSize(10).fillColor("#566573").text("Version 1.0 | End-to-End Postman Raw JSON Documentation", { align: "center" });
doc.moveDown(1);
doc.fontSize(12).fillColor("#000").font("Helvetica").text("Base URL: ", { continued: true }).font("Helvetica-Bold").text("http://localhost:8080/api/v1");
doc.moveDown(2);

// --- SECTION 1: SUPER ADMIN ---
subTitleStyle().text("1. SUPER ADMIN OPERATIONS (Platform Management)");
doc.moveDown(0.5);

const superAdminEndpoints = [
    {
        name: "Login (Super Admin)",
        method: "POST",
        path: "/auth/login",
        desc: "Authenticate as Super Admin.",
        body: { email: "superadmin@xtown.com", password: "password123" }
    },
    {
        name: "Create Company",
        method: "POST",
        path: "/companies",
        desc: "Onboard a new company to the platform.",
        body: {
            name: "Global Tech Solutions",
            officialEmail: "hr@globaltech.com",
            website: "https://globaltech.com",
            address: "Tech Park, Building 5",
            city: "San Francisco",
            state: "California",
            country: "USA",
            pinCode: "94105"
        }
    },
    {
        name: "Create Admin User",
        method: "POST",
        path: "/users",
        desc: "Create an Admin account for a specific company.",
        body: {
            name: "Company Admin",
            email: "admin@globaltech.com",
            password: "SecurePassword@123",
            role_id: 2,
            companyId: "[[COMPANY_UUID]]"
        }
    }
];

renderSection(superAdminEndpoints);

doc.addPage();

// --- SECTION 2: ADMIN ---
subTitleStyle().text("2. ADMIN OPERATIONS (Company Management)");
doc.moveDown(0.5);

const adminEndpoints = [
    {
        name: "Create Department",
        method: "POST",
        path: "/departments",
        body: { name: "Software Development", description: "Department for all IT engineers" }
    },
    {
        name: "Create Designation",
        method: "POST",
        path: "/designations",
        body: { name: "Full Stack Developer", departmentId: "[[DEPT_UUID]]" }
    },
    {
        name: "Onboard Employee (Full Biodata)",
        method: "POST",
        path: "/employees",
        desc: "Step 1: Create basic record.",
        body: {
          employeeCode: "GT-101",
          firstName: "Michael",
          lastName: "Scott",
          officialEmail: "michael.scott@globaltech.com",
          departmentId: "[[DEPT_UUID]]",
          designationId: "[[DESG_UUID]]",
          dateOfJoining: "2024-05-01",
          employeeType: "PERMANENT"
        }
    },
    {
        name: "Update Employee Personal Info",
        method: "PUT",
        path: "/employees/:id/personal",
        body: {
          dateOfBirth: "1985-03-15",
          gender: "MALE",
          maritalStatus: "MARRIED",
          bloodGroup: "B+",
          nationality: "American"
        }
    },
    {
        name: "Update Employee Bank Info",
        method: "PUT",
        path: "/employees/:id/bank",
        body: {
          bankName: "Silicon Valley Bank",
          accountHolderName: "Michael Scott",
          accountNumber: "9876543210123",
          ifscCode: "SVB0000123",
          accountType: "SALARY"
        }
    },
    {
        name: "Update Employee Salary",
        method: "PUT",
        path: "/employees/:id/salary",
        body: {
          basicSalary: 60000,
          hra: 25000,
          da: 10000,
          medicalAllowance: 5000,
          conveyance: 2000,
          deductions: 1500,
          netSalary: 100500,
          effectiveFrom: "2024-05-01"
        }
    },
    {
        name: "Create Work Shift",
        method: "POST",
        path: "/shift/create",
        body: { shift_name: "General Shift", start_time: "10:00:00", end_time: "18:00:00" }
    },
    {
        name: "Create Leave Type",
        method: "POST",
        path: "/leave/type",
        body: { leaveName: "Annual Leave", maxDaysPerYear: 20, isActive: true }
    },
    {
        name: "Monthly Leave Credit",
        method: "POST",
        path: "/leave/credit-balance",
        desc: "Credit 1.5 days to all employees.",
        body: {}
    },
    {
        name: "Approve Leave Request",
        method: "PATCH",
        path: "/leave/request/:id/status",
        body: { status: "Approved" }
    },
    {
        name: "Create Project",
        method: "POST",
        path: "/project/create",
        body: {
            project_name: "HRMS Mobile App",
            project_head: "[[EMP_UUID]]",
            developers: ["[[EMP_UUID_1]]", "[[EMP_UUID_2]]"],
            status: "planned"
        }
    }
];

renderSection(adminEndpoints);

doc.addPage();

// --- SECTION 3: END USER (EMPLOYEE) ---
subTitleStyle().text("3. END USER OPERATIONS (Employee Self-Service)");
doc.moveDown(0.5);

const userEndpoints = [
    {
        name: "Manual Attendance Punch",
        method: "POST",
        path: "/attendance/manual",
        desc: "Employee punches in/out manually.",
        body: { punchType: "IN" }
    },
    {
        name: "Apply For Leave",
        method: "POST",
        path: "/leave/request",
        body: {
          leaveTypeId: 1,
          fromDate: "2024-06-15",
          toDate: "2024-06-16",
          reason: "Family event"
        }
    },
    {
        name: "Apply For Resignation",
        method: "POST",
        path: "/resignation/apply",
        body: {
          employee_id: "[[MY_UUID]]",
          reason: "Relocating to another city",
          notice_period: 30,
          last_working_date: "2024-12-31"
        }
    },
    {
        name: "View Dashboard Summary",
        method: "GET",
        path: "/dashboard/summary",
        body: {}
    },
    {
        name: "Mark Notification Read",
        method: "PATCH",
        path: "/notification/:id/read",
        body: {}
    }
];

renderSection(userEndpoints);

// --- FOOTER AND END ---
function renderSection(endpoints) {
    endpoints.forEach(ep => {
        if (doc.y > 680) doc.addPage();
        
        doc.fontSize(12).fillColor("#1B2631").font("Helvetica-Bold").text(ep.name);
        methodStyle(ep.method).text(`${ep.method} `, { continued: true }).fillColor("#2E86C1").text(ep.path);
        
        if (ep.desc) {
            doc.fontSize(10).fillColor("#566573").font("Helvetica-Oblique").text(`Note: ${ep.desc}`);
        }
        
        doc.moveDown(0.2);
        bodyLabelStyle().text("Body (Raw JSON):");
        jsonStyle().text(JSON.stringify(ep.body, null, 4), { indent: 20 });
        
        doc.moveDown(0.6);
        doc.rect(doc.x, doc.y, 500, 0.5).fill("#D5D8DC");
        doc.moveDown(1);
    });
}

doc.end();
console.log("Mega Full-Project Postman Guide PDF generated!");
