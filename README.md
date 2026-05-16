# ระบบบริหารจัดการโครงสร้างสถานศึกษาอาชีวศึกษา
## วิทยาลัยการอาชีพพนมไพร

> ระบบจัดการโครงสร้างบุคลากรแบบ Drag & Drop สำหรับสถานศึกษาอาชีวศึกษา พร้อมระบบจัดการบุคลากร, Dashboard สถิติ, ส่งออก PDF/Excel และรองรับหลายปีการศึกษา

---

## ✨ ฟีเจอร์หลัก

### 🏗️ โครงสร้างองค์กร
- **Drag & Drop** ลากวางบุคลากรเข้าตำแหน่งต่างๆ ได้อย่างสะดวก
- **Role Placement Rules** กฎการจัดวางอัจฉริยะ ป้องกันการวางบุคลากรผิดตำแหน่ง
  - ผู้อำนวยการ → วางได้เฉพาะช่อง ผู้อำนวยการ
  - รองผู้อำนวยการ → วางได้เฉพาะช่อง รองผู้อำนวยการ
  - ข้าราชการครู → หัวหน้างาน, ผู้ช่วยหัวหน้างาน
  - พนักงานราชการครู → หัวหน้างาน, ผู้ช่วยหัวหน้างาน, เจ้าหน้าที่งาน
  - ครูพิเศษสอน → ผู้ช่วยหัวหน้างาน, เจ้าหน้าที่งาน
  - เจ้าหน้าที่ → เจ้าหน้าที่งาน
- **Edit Mode** สลับโหมดแก้ไข/ดูอย่างเดียว ป้องกันการแก้ไขโดยไม่ตั้งใจ
- **รองรับหลายปีการศึกษา** สลับดูโครงสร้างแต่ละปีได้
- **คัดลอกจากปีก่อน** คัดลอกโครงสร้างข้ามปีการศึกษาได้ในคลิกเดียว

### 👥 จัดการบุคลากร
- เพิ่ม/แก้ไข/ลบ บุคลากร ผ่านหน้า Admin
- **Import CSV** นำเข้าบุคลากรจำนวนมากจากไฟล์ CSV พร้อม Template ดาวน์โหลด
- ตัวกรองตามตำแหน่งหลัก (ผอ., รอง ผอ., ข้าราชการครู, ฯลฯ)
- จัดเรียงตามหมวดหมู่ พร้อม Group Header สีแยกตามตำแหน่ง
- Badge ตำแหน่งหลักแสดงบนการ์ดทุกจุด

### 📊 Dashboard & สถิติ
- แสดงภาพรวม: บุคลากรทั้งหมด, ได้รับมอบหมาย, ยังไม่มอบหมาย
- ตำแหน่งว่าง (หัวหน้า), จำนวนงาน/คน (เฉลี่ย), ตำแหน่งทั้งหมด

### 🔍 ค้นหาบุคลากร
- ค้นชื่อบุคลากร → Highlight ตำแหน่งในโครงสร้าง (กระพริบสีทอง 4 วินาที)

### 📑 ส่งออกรายงาน
- **PDF** พิมพ์โครงสร้างทั้งหมด (A4 Landscape)
- **Excel (.xlsx)** ส่งออก 2 ชีท: โครงสร้าง + รายชื่อบุคลากร

### 🔐 ระบบสิทธิ์
- Login/Logout ด้วย Token-based Authentication
- Guest = ดูอย่างเดียว, Admin = แก้ไขได้ทั้งหมด
- เปลี่ยนรหัสผ่าน Admin ผ่านหน้าตั้งค่า

### 📱 Responsive Design
- รองรับ Desktop, Tablet, Mobile
- ปุ่มซ่อนข้อความบนจอเล็ก แสดงเฉพาะ Icon

---

## 🛠️ เทคโนโลยี

| ส่วน | เทคโนโลยี |
|------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS |
| **UI Libraries** | @hello-pangea/dnd, SweetAlert2, Lucide React |
| **Export** | SheetJS (xlsx) |
| **Backend** | PHP 8 (REST API) |
| **Database** | MySQL / MariaDB |
| **Web Server** | Apache (XAMPP) |

---

## 📁 โครงสร้างโปรเจกต์

```
pnpman/
├── api/                          # PHP Backend API
│   ├── db.php                    # Database connection
│   ├── auth.php                  # Authentication middleware
│   ├── login.php                 # Login endpoint
│   ├── change_password.php       # Change password
│   ├── get_data.php              # Get all data (departments, jobs, personnel, assignments)
│   ├── manage_personnel.php      # CRUD personnel
│   ├── assign_job.php            # Assign personnel to job
│   ├── remove_assignment.php     # Remove assignment
│   ├── clear_assignments.php     # Clear all assignments for a year
│   ├── copy_year.php             # Copy assignments between years
│   ├── import_csv.php            # Import personnel from CSV
│   └── csv_template.php          # Download CSV template
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── App.jsx               # Main application (Drag & Drop, Search, Export)
│   │   ├── index.css             # Global styles & theme
│   │   └── components/
│   │       ├── OrgChart.jsx      # Organization chart with department tabs
│   │       ├── JobZone.jsx       # Job card with role zones
│   │       ├── DeptSectionBox.jsx # Department section (แผนกวิชา)
│   │       ├── StaffPool.jsx     # Staff pool with filter & badges
│   │       ├── DashboardStats.jsx # Statistics dashboard
│   │       ├── PersonnelAdminModal.jsx # Personnel CRUD + CSV import
│   │       ├── PersonnelModal.jsx # Personnel detail modal
│   │       ├── SettingsModal.jsx  # Settings (change password)
│   │       ├── LoginModal.jsx    # Login form
│   │       └── PrintReport.jsx   # Print report layout
│   ├── public/
│   │   └── logo.png              # College logo
│   └── dist/                     # Production build output
│
├── database.sql                  # Database schema & seed data
└── README.md
```

---

## 🚀 การติดตั้ง

### ความต้องการ
- XAMPP (Apache + MySQL + PHP 8)
- Node.js 18+ & npm

### ขั้นตอน

#### 1. Clone โปรเจกต์
```bash
git clone https://github.com/MontienNgamkaew/pnpman.git
```

#### 2. วางไว้ใน htdocs
```bash
# ย้ายไปที่ htdocs ของ XAMPP
mv pnpman /xampp/htdocs/
```

#### 3. สร้างฐานข้อมูล
```sql
-- สร้างฐานข้อมูลใน phpMyAdmin หรือ MySQL CLI
CREATE DATABASE pnpman CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Import ไฟล์ database.sql
SOURCE /path/to/pnpman/database.sql;
```

#### 4. ตั้งค่า Database Connection
แก้ไข `api/db.php`:
```php
$host = 'localhost';
$dbname = 'pnpman';
$username = 'root';
$password = '';
```

#### 5. ติดตั้ง Frontend Dependencies
```bash
cd frontend
npm install
```

#### 6. Build Frontend
```bash
npm run build
```

#### 7. เปิดใช้งาน
เปิด XAMPP → Start Apache & MySQL → เข้า http://localhost/pnpman/frontend/dist/

---

## 🔑 ข้อมูลเข้าสู่ระบบเริ่มต้น

| Username | Password |
|----------|----------|
| `admin`  | `1234`   |

> ⚠️ กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบครั้งแรก ผ่านเมนู **ตั้งค่า**

---

## 📋 API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/api/get_data.php?year=2569` | ดึงข้อมูลทั้งหมด |
| POST | `/api/login.php` | เข้าสู่ระบบ |
| POST | `/api/manage_personnel.php` | จัดการบุคลากร (add/update/delete) |
| POST | `/api/assign_job.php` | มอบหมายงาน |
| POST | `/api/remove_assignment.php` | ลบการมอบหมาย |
| POST | `/api/clear_assignments.php` | เคลียร์ทั้งหมด (ตามปี) |
| POST | `/api/copy_year.php` | คัดลอกข้ามปี |
| POST | `/api/import_csv.php` | นำเข้า CSV (multipart/form-data) |
| GET | `/api/csv_template.php` | ดาวน์โหลด CSV Template |
| POST | `/api/change_password.php` | เปลี่ยนรหัสผ่าน |

---

## 🎨 ธีมสี

ระบบใช้ธีม **แดงเลือดหมู (Maroon)** เป็นสีหลัก:
- Header: `#6b1525 → #8b1a2b`
- พื้นหลัง: ชมพูอ่อน `#fdf2f2`
- สามารถปรับแต่งสีได้ที่ `frontend/src/index.css`

---

## 📄 License

MIT License — สามารถนำไปใช้และปรับปรุงได้อย่างอิสระ

---

## 👨‍💻 พัฒนาโดย

**วิทยาลัยการอาชีพพนมไพร** — ระบบบริหารจัดการโครงสร้างสถานศึกษาอาชีวศึกษา
