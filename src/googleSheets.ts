import { google, Auth } from "googleapis";
import credentials from "../credentials.json";
import { config } from "../config";

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  // configure a JWT auth client
  let jwtClient = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    // keyId: credentials.private_key_id,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/calendar",
    ],
    // subject: credentials.client_email
    ...credentials,
  });

  //authenticate request
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("Successfully connected!");
    }
  });
  return jwtClient;
}

async function getData(jwtClient: Auth.JWT): Promise<string[][]> {
  const sheets = google.sheets({ version: "v4", auth: jwtClient });

  const names = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!${config.sheetRange}`,
    // range: "Sheet1!A1:B2",
  });

  const
  const rows = (res.data.values as string[][]) || [];

  return rows;
  // if (!rows || rows.length === 0) {
  //   console.log("No data found.");
  //   return;
  // }
  // console.log("Name, Major:");
  // rows.forEach((row) => {
  //   // Print columns A and E, which correspond to indices 0 and 4.
  //   console.log(`${row[0]}, ${row[4]}`);
  // });
}

function getDaysBetweenDates(start: Date, end: Date) {
  const days = [];
  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

export async function getSheetsData() {
  console.log("Hello Sheet Shamer!");
  console.log(config);
  let jwtClient: Auth.JWT;
  let data: string[][] = [];
  try {
    jwtClient = await authorize();
    if (!jwtClient) {
      console.log("auth is null");
      return;
    }
    data = await getData(jwtClient);
  } catch (err) {
    console.log("Error in authorization:", err);
  }

  // parse data
  const parsedData = data.map((row) => {
    return {
      idx: row[0],
      name: row[1],
      locationDates: row.slice(2, row.length),
    };
  }

  return data;
}
