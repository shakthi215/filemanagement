# ⬡ BizFiles — Business File Management System

A full-stack business file management application built with React, Node.js, Express, MongoDB, and Cloudinary.

---

## 🚀 Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | React 18, React Router 6, Context API |
| Backend   | Node.js, Express.js                   |
| Database  | MongoDB Atlas                         |
| Storage   | Cloudinary                            |
| Auth      | JWT + bcryptjs                        |
| Upload    | Multer (memory) + Cloudinary SDK      |

---

## 📁 Project Structure

```
bizfiles/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, GetMe
│   │   ├── fileController.js  # Upload, Get, Delete, Rename, Star
│   │   └── folderController.js # Create, List, Rename, Delete, Breadcrumb
│   ├── middleware/
│   │   ├── auth.js            # JWT protect middleware
│   │   └── upload.js          # Multer + file type validation
│   ├── models/
│   │   ├── User.js            # name, email, password, storageUsed
│   │   ├── Folder.js          # name, userId, parentFolderId, color
│   │   └── File.js            # name, url, publicId, type, size, folderId
│   ├── routes/
│   │   ├── auth.js
│   │   ├── files.js
│   │   └── folders.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── Sidebar.js         # Folder tree + storage meter
│   │   │   │   ├── Toolbar.js         # Search, filter, sort, view toggle
│   │   │   │   └── Breadcrumb.js      # Navigation breadcrumb
│   │   │   ├── Files/
│   │   │   │   ├── FileGrid.js        # Grid + list view with context menu
│   │   │   │   ├── FilePreview.js     # Image / PDF lightbox
│   │   │   │   └── UploadZone.js      # Drag & drop upload with queue
│   │   │   ├── Folders/
│   │   │   │   ├── FolderGrid.js      # Folder cards with context menu
│   │   │   │   └── NewFolderModal.js  # Create folder with color picker
│   │   │   └── UI/
│   │   │       ├── Modal.js
│   │   │       ├── ConfirmDialog.js
│   │   │       └── Spinner.js
│   │   ├── context/
│   │   │   ├── AuthContext.js         # User auth state
│   │   │   └── FileManagerContext.js  # Files + folders state
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   └── DashboardPage.js
│   │   ├── services/
│   │   │   └── api.js                # Axios instance + all API calls
│   │   ├── utils/
│   │   │   └── fileUtils.js          # Formatters, type helpers, colors
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css                 # Global CSS variables + animations
│   └── package.json
│
├── .gitignore
├── package.json                       # Root — runs both servers concurrently
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account (free tier works)
- **Cloudinary** account (free tier works)

---

## 🛠️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourname/bizfiles.git
cd bizfiles
```

### 2. Configure Backend Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/bizfiles
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:3000
```

### 3. Configure Frontend Environment

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Install all dependencies

```bash
# From project root:
npm run install:all

# Or install individually:
cd backend && npm install
cd ../frontend && npm install
```

### 5. Run both servers

```bash
# From project root (requires concurrently):
npm install
npm run dev
```

Or run separately:

```bash
# Terminal 1 — Backend
cd backend
npm run dev         # runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm start           # runs on http://localhost:3000
```

---

## 🔐 Authentication

| Endpoint                  | Method | Access  | Description         |
|---------------------------|--------|---------|---------------------|
| `/api/auth/register`      | POST   | Public  | Create account      |
| `/api/auth/login`         | POST   | Public  | Login, receive JWT  |
| `/api/auth/me`            | GET    | Private | Current user info   |

**Request body for register:**
```json
{ "name": "Jane Doe", "email": "jane@co.com", "password": "secret123" }
```

---

## 📁 Folder Endpoints

| Endpoint                        | Method | Description                   |
|---------------------------------|--------|-------------------------------|
| `/api/folders/create`           | POST   | Create folder (with parent)   |
| `/api/folders`                  | GET    | Get folders by parent         |
| `/api/folders/all`              | GET    | Full flat folder list          |
| `/api/folders/:id`              | PUT    | Rename / recolor folder        |
| `/api/folders/:id`              | DELETE | Delete folder + all contents  |
| `/api/folders/:id/breadcrumb`   | GET    | Breadcrumb path to folder     |

---

## 📄 File Endpoints

| Endpoint                  | Method | Description                       |
|---------------------------|--------|-----------------------------------|
| `/api/files/upload`       | POST   | Upload file (multipart/form-data) |
| `/api/files`              | GET    | All user files (search/filter)    |
| `/api/files/:folderId`    | GET    | Files in a folder                 |
| `/api/files/:id`          | PUT    | Rename file                       |
| `/api/files/:id/move`     | PUT    | Move file to another folder       |
| `/api/files/:id/star`     | PUT    | Toggle star                       |
| `/api/files/:id`          | DELETE | Delete file from DB + Cloudinary  |
| `/api/files/stats`        | GET    | Storage stats by file type        |

**Upload example (multipart):**
```
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
folderId: <optional folder id>
```

---

## 🌩️ Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier = 25GB storage + 25GB bandwidth/month)
2. Go to **Dashboard** → copy Cloud Name, API Key, API Secret
3. Paste into `backend/.env`

Files are uploaded to `bizfiles/<userId>/` folder in your Cloudinary media library.

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs** (12 salt rounds)
- **JWT** authentication with configurable expiry
- All routes protected — users can only access their own files
- File type whitelist enforced server-side
- 50MB max file size enforced via Multer
- Cloudinary files deleted when DB records are deleted
- CORS restricted to configured `CLIENT_URL`

---

## 🎨 UI Features

- **Dark theme** with CSS custom properties
- **Grid & List view** toggle
- **Drag & drop** upload zone with file queue
- **File preview** lightbox for images and PDFs
- **Context menus** (right-click) on files and folders
- **Breadcrumb navigation** for nested folders
- **Search**, **type filter**, and **sort** controls
- **Storage meter** in sidebar
- **Color-coded** folder icons
- **Starred files** support
- **Toast notifications** for all actions
- Responsive design

---

## 🗄️ Database Schemas

### User
```js
{ name, email, password (hashed), storageUsed, createdAt }
```

### Folder
```js
{ name, userId, parentFolderId, color, isStarred, createdAt }
```

### File
```js
{ name, originalName, url, publicId, type, mimeType, extension,
  size, folderId, userId, thumbnail, resourceType, isStarred, createdAt }
```

---

## 📦 Key Dependencies

### Backend
| Package             | Purpose                              |
|---------------------|--------------------------------------|
| express             | HTTP server & routing                |
| mongoose            | MongoDB ODM                          |
| jsonwebtoken        | JWT auth tokens                      |
| bcryptjs            | Password hashing                     |
| cloudinary          | Cloud file storage SDK               |
| multer              | Multipart file upload handling       |
| streamifier         | Buffer → readable stream for upload  |
| cors                | Cross-origin request handling        |
| dotenv              | Environment variable loading         |

### Frontend
| Package             | Purpose                              |
|---------------------|--------------------------------------|
| react-router-dom    | Client-side routing                  |
| axios               | HTTP client with interceptors        |
| react-toastify      | Toast notifications                  |
| react-dropzone      | Drag & drop file upload              |

---

## 📝 License

MIT — free to use, modify, and distribute.
