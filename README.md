
# YeneChat - Secure Chat Application

YeneChat is a secure, full-stack chat application designed for real-time messaging with end-to-end encryption. It integrates user authentication, secure message storage, and real-time communication features. The application ensures privacy and security by encrypting messages before storing them in the database.

---

## **Features**

1. **User Authentication**:
   - Secure registration and login with email and password.
   - Password hashing using bcrypt.
   - JWT-based session management.

2. **End-to-End Encryption**:
   - Messages are encrypted using AES-256-CBC before being stored in the database.
   - Each message has a unique initialization vector (IV) for enhanced security.

3. **Real-Time Messaging**:
   - Real-time message delivery using WebSockets (Socket.io).
   - Mark messages as "sent," "delivered," or "read."

4. **User Management**:
   - Update user profile (e.g., profile picture).
   - Fetch all users for chat initiation.

5. **Message Management**:
   - Send, receive, and delete messages.
   - Pagination for fetching message history.
   - Mark messages as read.

6. **File Attachments**:
   - Support for file attachments in messages.
   - Upload files to Cloudinary and store secure URLs.

7. **Responsive UI**:
   - Modern and intuitive user interface.
   - Mobile-friendly design.

8. **Theming**:
   - Customizable themes for the chat interface.

---

## **Tech Stack**

### **Frontend**:
- **React**: Frontend framework for building the user interface.
- **Tailwind CSS**: For styling and responsive design.
- **Socket.io**: For real-time communication.
- **Axios**: For making API requests.

### **Backend**:
- **Node.js**: Runtime environment for the backend.
- **Express.js**: Framework for building the REST API.
- **MongoDB**: Database for storing user data and encrypted messages.
- **Mongoose**: For MongoDB object modeling.
- **bcrypt**: For password hashing.
- **jsonwebtoken**: For JWT-based authentication.
- **crypto**: For AES-256-CBC encryption.

### **Real-Time Communication**:
- **Socket.io**: For real-time message delivery and updates.

### **File Storage**:
- **Cloudinary**: For storing and serving file attachments.

### **Other Tools**:
- **dotenv**: For managing environment variables.
- **CORS**: For enabling cross-origin requests.
- **Helmet**: For securing HTTP headers.
- **Rate Limiting**: To prevent abuse of the API.

---

## **Setup Instructions**

### **Prerequisites**:
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for file storage)
- Socket.io (for real-time communication)

### **Steps**:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/SoloAk21/aether-ai.git
   cd aether-ai
   ```

2. **Install Dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the `backend` directory:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/aether-ai
     JWT_SECRET=your-jwt-secret
     CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
     CLOUDINARY_API_KEY=your-cloudinary-api-key
     CLOUDINARY_API_SECRET=your-cloudinary-api-secret
     ENCRYPTION_KEY=your-32-byte-encryption-key
     FRONTEND_URL=http://localhost:3000
     ```

   - Create a `.env` file in the `frontend` directory:
     ```env
     VITE_BACKEND_URL=http://localhost:5000
     ```

4. **Start the Backend Server**:
   ```bash
   cd backend
   npm start
   ```

5. **Start the Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`.

---
