# Chat Website
A simple real-time chat website built with Node.js, Socket.IO, and MongoDB.

## Table of Contents
1. [File Description](#file-description)
2. [Install Prerequisites](#install-prerequisites)
3. [Deploy to the Cloud (AWS EC2)](#deploy-to-the-cloud)
4. [maintence guide]

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
- **create EC2**
- **Settings**:
  - **AMI**: Choose `Amazon Linux 2023 AMI`.
  - **Instance Type**: Select `t2.micro` 
  - **Key Pair**: Create a new key pair (e.g., `chat-website-key.pem`) or select an existing one. Download and save the `.pem` file securely.
  - **Security Group**: Create a new security group with:
    - **HTTP (port 80)**: Allow inbound traffic for web access.
    - **Custom TCP (port 3000)**: Allow Node.js app port.
    - **SSH (port 22)**: Allow SSH access (restrict to your IP for security, e.g., `203.0.113.0/32`).
- Launch the instance and note its public IP 

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

#### 4 maintain guide for website
Table of Contents:

1. Clearing Chat History
2. Minor Code Modifications (Edit Specific Lines)
3. Major Code Modifications (Replace Entire Files)
Best Practices and Troubleshooting

---

##### Prerequisites

- **Backup First**: Always backup before changes.
  - Backup MongoDB:
    ```bash
    mongodump --db chatdb --out /home/ec2-user/backup-$(date +%F)
    ```
  - Backup files:
    ```bash
    cp /home/ec2-user/chat-website/server.js /home/ec2-user/chat-website/server.js.bak
    cp /home/ec2-user/chat-website/public/index.html /home/ec2-user/chat-website/public/index.html.bak
    ```

---

### 1. Clearing Chat History
Chat history is stored in MongoDB's `chatdb` database, in the `messages` collection. Clearing it deletes all messages but keeps the database structure.

#### Steps on EC2:
1. Connect to EC2 (via EC2 Instance Connect or SSH).
2. Stop the app to avoid conflicts:
   ```bash
   pm2 stop chat-app
   ```
3. Enter MongoDB shell:
   ```bash
   mongosh
   ```
4. Switch to the database and clear messages:
   ```javascript
   use chatdb
   db.messages.deleteMany({})
   ```
   - Expected output: `{ acknowledged: true, deletedCount: X }` (X is the number of deleted messages).
5. Verify clearance:
   ```javascript
   db.messages.find().pretty()
   ```
   - Should return no results (empty).
6. Exit shell:
   ```javascript
   exit
   ```
7. Restart the app:
   ```bash
   pm2 restart chat-app
   pm2 save
   ```
8. Test the website (`http://<EC2-Public-IP>`):
   - Reload the page; history should be empty.
   - Send a new message to verify saving.



### 2. Minor Code Modifications (Edit Specific Lines)
For small changes (e.g., update a line in `server.js` or `index.html`), edit files directly on EC2 using a text editor like nano. This is quick but requires caution.

#### Steps:
1. Connect to EC2 (via EC2 Instance Connect or SSH).
2. Stop the app:
   ```bash
   pm2 stop chat-app
   ```
3. Edit the file:
   - For `server.js`:
     ```bash
     nano /home/ec2-user/chat-website/server.js
     ```
   - For `index.html`:
     ```bash
     nano /home/ec2-user/chat-website/public/index.html
     ```
   - Navigate with arrow keys, edit lines, save (Ctrl+O, Enter, Ctrl+X).
   - Example: In `server.js`, change default user to "Guest":
     Modify line:
     ```javascript
     const message = new Message({ user: msg.user || 'Guest', message: msg.text });
     ```
4. Restart the app:
   ```bash
   pm2 restart chat-app
   pm2 save
   ```
5. Check logs:
   ```bash
   pm2 logs
   ```
   - Look for errors or confirmation (e.g., "MongoDB 連線成功").
6. Test the website (`http://<EC2-Public-IP>`):
   - Verify the change (e.g., new default user in messages).


---

### 3. Major Code Modifications (Replace Entire Files)
For large changes (e.g., rewrite `server.js` or overhaul `index.html`), edit locally, test, then upload and replace the files on EC2.

#### Steps (Local):
1. Edit files locally (e.g., in VS Code).
2. Test locally:
   - Start MongoDB:
     ```powershell
     mongod
     ```
   - Run app:
     ```powershell
     cd C:\path\to\chat-website
     npm install
     npm start
     ```
   - Test `http://localhost:3000`.

#### Steps (Deploy to EC2):
1. Connect to EC2 and stop the app:
   ```bash
   pm2 stop chat-app
   ```
2. Backup old files:
   ```bash
   cp /home/ec2-user/chat-website/server.js /home/ec2-user/chat-website/server.js.bak
   cp /home/ec2-user/chat-website/public/index.html /home/ec2-user/chat-website/public/index.html.bak
   ```
3. Upload from local PowerShell:
   ```powershell
   scp -i "C:\path\to\chat-website-key.pem" "C:\path\to\chat-website\server.js" ec2-user@<EC2-Public-IP>:/home/ec2-user/chat-website/
   scp -i "C:\path\to\chat-website-key.pem" "C:\path\to\chat-website\public\index.html" ec2-user@<EC2-Public-IP>:/home/ec2-user/chat-website/public/
   ```
4. On EC2, install new dependencies (if added):
   ```bash
   cd /home/ec2-user/chat-website
   npm install
   ```
5. Restart the app:
   ```bash
   pm2 restart chat-app
   pm2 save
   ```
6. Check logs:
   ```bash
   pm2 logs
   ```
7. Test the website (`http://<EC2-Public-IP>`).

#### Tips:
- **Full Folder Update**: If changing multiple files, upload the entire folder:
  ```powershell
  scp -i "C:\path\to\chat-website-key.pem" -r "C:\path\to\chat-website" ec2-user@<EC2-Public-IP>:/home/ec2-user/
  ```
- **Rollback**: Restore from backups:
  ```bash
  cp /home/ec2-user/chat-website/server.js.bak /home/ec2-user/chat-website/server.js
  pm2 restart chat-app
  ```

---

### 5. Best Practices and Troubleshooting
- **Backup Regularly**: MongoDB data (`mongodump`), files (`cp .bak`), and full snapshot (EC2 AMI).
- **Security**: Limit security group to your IP for ports 80/3000/22. Enable MongoDB authentication (see earlier guides).
- **Monitoring**:
  - Resources: `top` or `sudo dnf install htop -y; htop`.
  - Logs: `pm2 logs`, `sudo tail -f /var/log/nginx/error.log`, `sudo tail -f /var/log/mongodb/mongod.log`.
- **Common Issues**:
  - **App Crashes**: Check `pm2 logs` for errors (e.g., syntax in `server.js`).
  - **Website Not Updating**: Reload Nginx (`sudo systemctl reload nginx`), clear browser cache (Ctrl+Shift+R).
  - **MongoDB Errors**: Check `sudo systemctl status mongod`. Restart if needed (`sudo systemctl restart mongod`).
  - **Permission Denied**: Fix permissions (`chmod 644 <file>`).
- **Automation**: Use Git for version control (see earlier guides). Set up GitHub Actions for auto-deploy on push.
- **Costs**: Monitor EC2 usage (free tier 750 hours/month). Stop instance when not in use via AWS Console.
- **Scaling**: For more users, consider MongoDB Atlas or AWS DocumentDB for high availability.

If you encounter errors or need help with specific changes (e.g., nickname filtering), provide logs for troubleshooting. Happy maintaining!





