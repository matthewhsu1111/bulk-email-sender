import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { parseCSV } from './csvParser';
import { sendEmail } from './emailSender';

const app = express();
const port = process.env.PORT || 3001;
const upload = multer({ dest: 'uploads/' });

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());

function replacePlaceholders(text: string, record: any): string {
  return text
    .replace(/{firstName}/g, record.firstName)
    .replace(/{companyName}/g, record.companyName);
}

app.post('/send-emails', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file || !req.body.subject || !req.body.body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const records = await parseCSV(req.file.path);

    for (const record of records) {
      let personalizedSubject = replacePlaceholders(req.body.subject, record);
      let personalizedBody = replacePlaceholders(req.body.body, record);
      
      // Convert newlines to HTML line breaks
      personalizedBody = personalizedBody.replace(/\n/g, '<br>');

      await sendEmail({
        to: record.email,
        subject: personalizedSubject,
        html: personalizedBody,
      });
    }

    res.json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while sending emails' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});