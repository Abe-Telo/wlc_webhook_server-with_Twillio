**Send Notifications From WLC Wbhook to a SMS or whatsapp using twilio.**


apt-get install npm

apt-get install node.js

apt-get install openssl 



openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

chmod 600 key.pem

npm install express twilio body-parser moment-timezone



Send the follwing data when sending data. 

URL https://YourserverURL:3000/sendMessage

phoneNumber: Phone number that will receave numbers. 

eventType: Call

method: sms or whatsapp

timeZone: New_York
