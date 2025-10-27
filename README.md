# chat-website
a simple chat website 

table of content
  1. File description
  2. Install prerequisistes
  3. How to deploy to the cloud

1.
  public contains the index.html file that displays the main page
  server.js file is the backend of the website
  package.json defines the Node.js project dependencies and scripts.
  package-lock.json locks dependency versions for consistent installs.
  

2.
   you need to install node.js from https://nodejs.org
   2.1 use following command to verify installation
     node --version
     npm --version
   terminal should show the version number

   2.2 Install Git from git-scm.com and install.
   (or you can directly download folder from github, you can skip 2.2)
       run command:
       git --version

      clone the repository
       run there two command
      git clone https://github.com/MOKMaxMOK/chat-website.git
      cd chat-website

   2.3 test (optional,but recommanded)
      Install Dependencies
      run command:
        npm install

      run the website locally
      run command:
        npm start
      Open http://localhost:3000

3.
  deploy to cloud

  
  I use AWS to demonstrate\
    
  In AWS, you can create an EC2
  AMI: Choose Amazon Linux 2 AMI 
  Instance Type: Select t2.micro 
Key Pair: Create or select a key pair (e.g., chat-website-key.pem) for SSH access. Save the .pem file securely.(need)

Security Group: Create a new security group with:
HTTP (port 80): Allow inbound traffic for web access.
Custom TCP (port 3000): Allow Node.js app port (adjust if server.js uses another port).
SSH (port 22): Allow SSH access from your IP.

after create. click into the EC2, and click connect button

3.1 set up the environment 
update system ,command:
sudo yum update -y

Install Node.js and npm,command:
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -sudo yum install -y nodejs

checking,command:
node --version
npm --version

3.2.1
upload from github(if you want to upload from local, follow the 3.2.2)
Clone the repository, command:
git clone https://github.com/MOKMaxMOK/chat-website.git
cd chat-website

install dependencies, command:
npm install

3.3 install MongoDB(use to save chat history)
Add the MongoDB repository,command:
sudo nano /etc/yum.repos.d/mongodb-org-5.0.repo

add the following content:
[mongodb-org-5.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/5.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc



3.4
run the website, command:
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save

   
   
   
