const express = require('express');
const twilio = require('twilio');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');  
const moment = require('moment-timezone');   

// SSL Certificate paths
const privateKeyPath = '/root/WLC-Webhook/key.pem';
const certificatePath = '/root/WLC-Webhook/cert.pem';

// Twilio credentials
const accountSid = 'YourSID';
const authToken = 'YourToken';
const twilioPhoneNumber = '1234567890';
const whatsappNumber = 'whatsapp:+1234567890';

const app = express();

// SSL credentials
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');
const passphrase = '0000';
const credentials = { key: privateKey, cert: certificate, passphrase: passphrase };

// Twilio client
const client = new twilio(accountSid, authToken);

// Use body-parser to parse JSON body
app.use(bodyParser.json());

app.post('/sendMessage', (req, res) => {
    //const { phoneNumber, multipleNumbers, eventType, method } = req.body;
	const { phoneNumber, multipleNumbers, eventType, method, timestamp, timeZone, caller_id_number, caller_id_name, call_direction } = req.body; // You can Add data. 

    // Convert timestamp to Date
    const date = new Date(timestamp);
    let formattedDate;

    // Format the date based on the provided timeZone
    // If timeZone is provided, use it with "America/" prefix
    if (timeZone) {
        formattedDate = moment(date).tz(`America/${timeZone}`).format('MM/DD/YYYY');
    } else {
        // If no timeZone is provided, use the default timezone
        formattedDate = moment(date).format('MM/DD/YYYY');
    }

    // Log the entire request body to see what data is being received
    console.log('Received data:', req.body);

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
