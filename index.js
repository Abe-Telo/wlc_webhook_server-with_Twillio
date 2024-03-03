const express = require('express');
const twilio = require('twilio');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser'); // Add body-parser to handle JSON body
const app = express();

// SSL Certificate paths
const privateKeyPath = '/root/wlc-webhook/key.pem';  // Change path to Key.pem
const certificatePath = '/root/wlc-webhook/cert.pem';  // Change path to Cert.pem
const passphrase = '0000';  // Key Pam credentials Password you set up. 
 
// Twilio credentials
const accountSid = 'YourSID'; // Your Twilio SID
const authToken = 'YourToken';  // Your Twilio Token
const twilioPhoneNumber = '1234567890';  // Your Twilio From Phone Number for SMS
const whatsappNumber = 'whatsapp:+1234567890';  // Your Twilio From Whatsapp Number to send from.

// SSL credentials
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');
const credentials = { key: privateKey, cert: certificate, passphrase: passphrase };
const moment = require('moment-timezone');

// Twilio client
const client = new twilio(accountSid, authToken);

// Use body-parser to parse JSON body
app.use(bodyParser.json());

app.post('/sendMessage', (req, res) => { 
	const { phoneNumber, multipleNumbers, eventType, method, timestamp, timeZone, caller_id_number, caller_id_name, call_direction } = req.body;

    // Convert timestamp to Date
    //const date = new Date(timestamp);
    const date = new Date(timestamp * 1000); // timestamp is in seconds 
   
    // Convert timestamp
    let formattedDate;

    // Format the date based on the provided timeZone
    if (timeZone) {
        formattedDate = moment(date).tz(`America/${timeZone}`).format('HH:mm:ss');
    } else {
        formattedDate = moment(date).format('HH:mm:ss');
    }
	
    // Log the entire request body to see what data is being received
    console.log('Received data:', req.body);
    console.log('Formatted Date Time:', formattedDate); 
	
    if (!method) {
        return res.status(400).send('Method is required');
    }

    let numbers = phoneNumber ? [phoneNumber] : [];
    if (multipleNumbers) {
        numbers = numbers.concat(multipleNumbers.split(','));
    }

    numbers.forEach(number => {
        let formattedNumber = `+${number.trim()}`;
        let toNumber = (method === 'whatsapp') ? `whatsapp:${formattedNumber}` : formattedNumber;
        let fromNumber = (method === 'whatsapp') ? whatsappNumber : twilioPhoneNumber;

        client.messages.create({
            body: `${call_direction} ${eventType} ${caller_id_name} ${caller_id_number} Date: ${formattedDate} `,
            to: toNumber,
            from: fromNumber
        })
        .then((message) => console.log(message.sid))
        .catch((error) => console.error(error));
    });

    res.send(`${method.toUpperCase()} message sent!`);
});

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);
const port = 3000;

httpsServer.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});
