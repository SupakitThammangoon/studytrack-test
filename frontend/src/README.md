# 📘 StudyTrack — ระบบจัดการงานและโปรเจกต์สำหรับนักศึกษา

ระบบจัดการงาน (Task Management) แบบ Kanban Board สำหรับนักศึกษา รองรับการสร้างวิชา/โปรเจกต์ จัดการงาน ติดตามกำหนดส่ง และทำงานร่วมกันเป็นทีม

> โปรเจกต์ส่งรายวิชา **CS363 Software Engineering**

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite) — UI framework
- **Tailwind CSS** — Styling
- **React Router** — Routing
- **Axios** — HTTP client
- **react-sortablejs** — Drag-and-drop
- **Font Awesome** — Icons

### Backend
- **Node.js + Express** — Web server
- **MongoDB Atlas + Mongoose** — Database & ODM
- **JWT (jsonwebtoken)** — Authentication
- **bcryptjs** — Password hashing
- **CORS, dotenv** — Utilities

## 🏗️ สถาปัตยกรรม

โปรเจกต์ใช้สถาปัตยกรรม **MVC (Model-View-Controller)** และให้บริการ API แบบ **RESTful**:

```
studytrack/
├── backend/                  ← Node.js + Express + MongoDB
│   ├── config/db.js          ← MongoDB connection
│   ├── models/               ← M: Mongoose schemas
│   │   ├── User.js
│   │   ├── Board.js
│   │   └── Task.js
│   ├── controllers/          ← C: Business logic
│   │   ├── authController.js
│   │   ├── boardController.js
│   │   └── taskController.js
│   ├── routes/               ← API endpoints
│   ├── middleware/           ← JWT protection
│   └── server.js
│
└── frontend/                 ← V: React UI
    └── src/
        ├── pages/            ← Login, Register, Dashboard, Board, Calendar
        ├── components/       ← Sidebar, TopBar, Modals, Notifications
        ├── context/          ← AuthContext (state management)
        └── services/api.js   ← API client
```

## ✨ Features

- 🔐 **Authentication** — สมัครสมาชิก / เข้าสู่ระบบ ด้วย JWT
- 📊 **Dashboard** — สถิติงาน, ความคืบหน้าแต่ละวิชา, งานด่วน
- 📋 **Kanban Board** — ลากการ์ดระหว่าง ต้องทำ / กำลังทำ / เสร็จแล้ว
- 📅 **Calendar View** — ดูงานในรูปแบบปฏิทิน (ปี พ.ศ.)
- 🔔 **Notifications** — แจ้งเตือนงานใกล้ครบกำหนด
- 👥 **Team Collaboration** — เชิญเพื่อนเข้าบอร์ดร่วมกัน
- 📱 **Responsive Design** — รองรับทั้ง Desktop และ Mobile (Extra credit)

## 🚀 วิธีการ Run โปรเจกต์

### ข้อกำหนดเบื้องต้น
- Node.js v18+ และ npm
- MongoDB Atlas account (ฟรี)

### 1. Clone repository

```bash
git clone https://github.com/SupakitThammangoon/studytrack-test.git
cd studytrack
```

### 2. ตั้งค่า Backend

```bash
cd backend
npm install
```

สร้างไฟล์ `.env` ใน `backend/` พร้อมข้อมูลนี้:

```env
PORT=5001
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/studytrack
JWT_SECRET=your_secret_key_change_me
NODE_ENV=development
```

รัน server:

```bash
npm run dev
```

Server จะรันที่ `http://localhost:5001`

### 3. ตั้งค่า Frontend

เปิด Terminal ใหม่:

```bash
cd frontend
npm install
npm run dev
```

เปิด browser: `http://localhost:5173`

## 📡 RESTful API Endpoints

| Method | Endpoint | คำอธิบาย | Auth |
|--------|----------|---------|------|
| POST | `/api/auth/register` | สมัครสมาชิก | ❌ |
| POST | `/api/auth/login` | เข้าสู่ระบบ | ❌ |
| GET | `/api/auth/me` | ดูข้อมูล user | ✅ |
| GET | `/api/boards` | ดูบอร์ดทั้งหมด | ✅ |
| POST | `/api/boards` | สร้างบอร์ด | ✅ |
| PUT | `/api/boards/:id` | แก้ไขบอร์ด | ✅ |
| DELETE | `/api/boards/:id` | ลบบอร์ด | ✅ |
| POST | `/api/boards/:id/members` | เพิ่มสมาชิก | ✅ |
| GET | `/api/tasks?boardId=X` | ดูงานในบอร์ด | ✅ |
| POST | `/api/tasks` | สร้างงาน | ✅ |
| PUT | `/api/tasks/:id` | แก้ไขงาน | ✅ |
| DELETE | `/api/tasks/:id` | ลบงาน | ✅ |

## 🎨 Screenshots

(สามารถเพิ่ม screenshot ในนี้ได้ภายหลัง)

## 📚 Concepts ที่ใช้ในโปรเจกต์

### 1. MVC Pattern
- **Model:** `backend/models/` — Mongoose schemas สำหรับ User, Board, Task
- **View:** `frontend/src/pages/` + `components/` — React components
- **Controller:** `backend/controllers/` — Business logic สำหรับแต่ละ endpoint

### 2. RESTful API
ใช้ HTTP methods ตามมาตรฐาน:
- `GET` ดึงข้อมูล
- `POST` สร้างใหม่
- `PUT` แก้ไข
- `DELETE` ลบ

URL pattern แบบ resource-based เช่น `/api/boards/:id`

### 3. Authentication & Security
- รหัสผ่านถูก hash ด้วย bcrypt ก่อนบันทึก
- JWT token หมดอายุใน 30 วัน
- Middleware `protect` ตรวจสอบ token ก่อนเข้าถึง protected routes

### 4. Responsive Design
- Mobile-first approach
- Tailwind breakpoints (`md:`, `lg:`)
- Hamburger menu สำหรับ mobile

## 📄 License

ISC — Educational Project