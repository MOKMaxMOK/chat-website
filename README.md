# Chat Website
A simple real-time chat website built with Node.js, Socket.IO, and MongoDB.

## Table of Contents
1. [File Description](#file-description)
2. [Install Prerequisites](#install-prerequisites)
3. [Deploy to the Cloud (AWS EC2)](#deploy-to-the-cloud)

---

### 1. File Description
- **`public/index.html`**: The front-end HTML file that displays the chat interface, including a nickname input for custom user names and a message input.
- **`server.js`**: The back-end Node.js script that handles Socket.IO for real-time messaging and connects to MongoDB for storing chat history.
- **`package.json`**: Defines Node.js project dependencies (e.g., `express`, `socket.io`, `mongoose`) and scripts (e.g., `npm start`).
- **`package-lock.json`**: Locks dependency versions for consistent installations.
- **`.env`**: Stores environment variables (e.g., `MONGODB_URI` for MongoDB connection). **Note**: Do not commit `.env` to GitHub for security.

---

### 2. Install Prerequisites
Before deploying, set up your local environment to test the application.

#### 2.1 Install Node.js
- Download and install Node.js from [nodejs.org](https://nodejs.org) 
- Verify installation:
command:
  node --version
  npm --version
  
  - Terminal should display version numbers (e.g., `v18.20.4`, `npm 10.8.3`).

#### 2.2 Install Git
- Download and install Git from [git-scm.com](https://git-scm.com).
- Verify installation:
  ```bash
  git --version
  ```
- Clone the repository:
  ```bash
  git clone https://github.com/MOKMaxMOK/chat-website.git
  cd chat-website
  ```
- **Alternative**: Download the repository as a ZIP file from GitHub and extract it, then skip to section 2.3.

#### 2.3 Install MongoDB (Optional for Local Testing)
- Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community).
- Start MongoDB locally:
  ```bash
  mongod
  ```
- Alternatively, use MongoDB Atlas (cloud-hosted MongoDB) and obtain a connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/chatdb`).

#### 2.4 Test Locally (Recommended)
- Install dependencies:
  ```bash
  cd chat-website
  npm install
  ```
- Create a `.env` file in the `chat-website` directory:
  ```env
  MONGODB_URI=mongodb://localhost:27017/chatdb
  PORT=3000
  ```
  - If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.
- Run the application:
  ```bash
  npm start
  ```
- Open `http://localhost:3000` in a browser.
- Test functionality:
  - Enter a nickname (e.g., "Alice") and click "Set Nickname".
  - Send a message and verify it displays with the nickname and timestamp.
  - Check MongoDB for stored messages:
    ```bash
    mongosh
    use chatdb
    db.messages.find().pretty()
    ```

---

### 3. Deploy to the Cloud (AWS EC2)
This section demonstrates deploying the chat website to an AWS EC2 instance using Amazon Linux 2023.

#### 3.1 Create an EC2 Instance
- **Log in to AWS Console**: Navigate to EC2 → Instances → Launch Instance.
- **Settings**:
  - **AMI**: Choose `Amazon Linux 2023 AMI`.
  - **Instance Type**: Select `t2.micro` (free tier eligible).
  - **Key Pair**: Create a new key pair (e.g., `chat-website-key.pem`) or select an existing one. Download and save the `.pem` file securely.
  - **Security Group**: Create a new security group with:
    - **HTTP (port 80)**: Allow inbound traffic for web access.
    - **Custom TCP (port 3000)**: Allow Node.js app port.
    - **SSH (port 22)**: Allow SSH access (restrict to your IP for security, e.g., `203.0.113.0/32`).
- Launch the instance and note its public IP (e.g., `98.93.24.173`).

#### 3.2 Set Up the EC2 Environment
- **Connect to EC2**:
  - Use AWS Console: EC2 → Instances → Select your instance (`ip-172-31-20-98`) → Click "Connect" → Choose "EC2 Instance Connect".
  - Or use SSH from local PowerShell:
    ```powershell
    ssh -i "C:\path\to\chat-website-key.pem" ec2-user@<EC2-Public-IP>
    ```
- **Update system**:
  ```bash
  sudo dnf update -y
  ```
- **Install Node.js**:
  ```bash
  curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo dnf install -y nodejs
  ```
  - Verify:
    ```bash
    node --version
    npm --version
    ```
- **Install Git**:
  ```bash
  sudo dnf install -y git
  git --version
  ```

#### 3.3 Install MongoDB
- Add MongoDB 8.0 repository (your environment uses MongoDB 8.0.15):
  ```bash
  sudo nano /etc/yum.repos.d/mongodb-org-8.0.repo
  ```
  - Add the following content:
    ```ini
    [mongodb-org-8.0]
    name=MongoDB Repository
    baseurl=https://repo.mongodb.org/yum/amazon/2023/mongodb-org/8.0/x86_64/
    gpgcheck=1
    enabled=1
    gpgkey=https://pgp.mongodb.com/server-8.0.asc
    ```
- Install MongoDB:
  ```bash
  sudo dnf install -y mongodb-org
  ```
- Start MongoDB:
  ```bash
  sudo systemctl start mongod
  sudo systemctl enable mongod
  ```
- Verify:
  ```bash
  mongosh --eval "db.version()"
  ```

#### 3.4 Deploy Application
##### 3.4.1 Option 1: Clone from GitHub
- Clone the repository:
  ```bash
  cd /home/ec2-user
  git clone https://github.com/MOKMaxMOK/chat-website.git
  cd chat-website
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Create `.env` file:
  ```bash
  nano .env
  ```
  - Add:
    ```env
    MONGODB_URI=mongodb://localhost:27017/chatdb
    PORT=3000
    ```

##### 3.4.2 Option 2: Upload from Local
- From your local PowerShell:
  ```powershell
  scp -i "C:\path\to\chat-website-key.pem" -r "C:\path\to\chat-website" ec2-user@<EC2-Public-IP>:/home/ec2-user/
  ```
- On EC2, verify files:
  ```bash
  ls /home/ec2-user/chat-website
  ```
  - Should see `public/`, `server.js`, `package.json`, etc.
- Install dependencies:
  ```bash
  cd /home/ec2-user/chat-website
  npm install
  ```
- Create `.env` file (as above).

#### 3.5 Install and Configure Nginx
- Install Nginx:
  ```bash
  sudo dnf install -y nginx
  ```
- Configure Nginx to proxy requests to Node.js:
  ```bash
  sudo nano /etc/nginx/nginx.conf
  ```
  - Add to the `http` block:
    ```nginx
    server {
        listen 80;
        server_name <EC2-Public-IP>;
        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        location /socket.io/ {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
    ```
- Test and restart Nginx:
  ```bash
  sudo nginx -t
  sudo systemctl restart nginx
  sudo systemctl enable nginx
  ```

#### 3.6 Run the Application
- Install PM2:
  ```bash
  npm install -g pm2
  ```
- Start the application:
  ```bash
  cd /home/ec2-user/chat-website
  pm2 start server.js --name chat-app
  pm2 startup
  pm2 save
  ```
- Verify:
  ```bash
  pm2 logs
  ```
  - Look for "MongoDB 連線成功" and "伺服器運行於 http://localhost:3000".

#### 3.7 Access the Website
- Open `http://<EC2-Public-IP>` (e.g., `http://98.93.24.173`) in a browser.
- Test functionality:
  - Set a nickname (e.g., "Alice") and send a message.
  - Verify messages appear with the nickname and timestamp.
- Check MongoDB:
  ```bash
  mongosh
  use chatdb
  db.messages.find().pretty()
  ```

#### 3.8 Updating Files
To update specific files (e.g., `index.html` or `server.js`):
- Stop the application:
  ```bash
  pm2 stop chat-app
  ```
- Upload updated files from local PowerShell:
  ```powershell
  scp -i "C:\path\to\chat-website-key.pem" "C:\path\to\chat-website\public\index.html" ec2-user@<EC2-Public-IP>:/home/ec2-user/chat-website/public/
  scp -i "C:\path\to\chat-website-key.pem" "C:\path\to\chat-website\server.js" ec2-user@<EC2-Public-IP>:/home/ec2-user/chat-website/
  ```
- Restart the application:
  ```bash
  pm2 restart chat-app
  ```

#### 3.9 Troubleshooting
- **Application not running**:
  ```bash
  pm2 logs
  ```
  - Check for errors (e.g., MongoDB connection issues).
- **Nginx errors**:
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```
- **MongoDB not running**:
  ```bash
  sudo systemctl status mongod
  sudo systemctl start mongod
  ```
- **Website not accessible**:
  - Verify security group allows ports 80 and 3000.
  - Check `http://<EC2-Public-IP>:3000` (bypasses Nginx).

#### 3.10 Best Practices
- **Backup**:
  ```bash
  mongodump --db chatdb --out /home/ec2-user/backup-$(date +%F)
  cp /home/ec2-user/chat-website/public/index.html /home/ec2-user/chat-website/public/index.html.bak
  cp /home/ec2-user/chat-website/server.js /home/ec2-user/chat-website/server.js.bak
  ```
- **Security**:
  - Restrict security group to your IP for SSH (port 22).
  - Enable MongoDB authentication:
    ```bash
    mongosh
    use admin
    db.createUser({ user: "admin", pwd: "your-password", roles: [{ role: "root", db: "admin" }] })
    ```
    - Update `/etc/mongod.conf`:
      ```yaml
      security:
        authorization: enabled
      ```
    - Restart MongoDB:
      ```bash
      sudo systemctl restart mongod
      ```
    - Update `.env`:
      ```env
      MONGODB_URI=mongodb://admin:your-password@localhost:27017/chatdb
      ```
- **Version Control**:
  - Commit changes to GitHub:
    ```bash
    git add .
    git commit -m "Update chat website"
    git push origin main
    ```

