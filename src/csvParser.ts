import { parse } from 'csv-parse';
import fs from 'fs';

interface EmailRecord {
  email: string;
  firstName: string;
  companyName: string;
}

export function parseCSV(filePath: string): Promise<EmailRecord[]> {
  return new Promise((resolve, reject) => {
    const results: EmailRecord[] = [];

    fs.createReadStream(filePath)
      .pipe(parse({ columns: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}