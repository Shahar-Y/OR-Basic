import { google, Auth } from "googleapis";
import credentials from "../credentials.json";
import { config } from "../config";

type Reporter = {
  name: string;
  location: string;
  prevLocation: string;
  phoneNumber: string;
};
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

async function getAllReporters(jwtClient: Auth.JWT): Promise<Reporter[]> {
  const sheets = google.sheets({ version: "v4", auth: jwtClient });

  const locationIdx = getNumOfDaysBetweenDates(
    new Date(config.sheetStartDate),
    new Date()
  );
  const locationCol = colIdxToLetter(
    locationIdx + letterToColumnIdx(config.sheetStartDateColumn) - 1
  );

  const prevLocationCol = colIdxToLetter(
    locationIdx + letterToColumnIdx(config.sheetStartDateColumn) - 2
  );

  console.log(
    "locationCol",
    locationCol,
    "prevLocationCol",
    prevLocationCol,
    "locationIdx",
    locationIdx
  );

  const locationsArray = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!${locationCol}2:${locationCol}${config.sheetRange}`,
  });

  const prevLocationsArray = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!${prevLocationCol}2:${prevLocationCol}${config.sheetRange}`,
  });

  const phoneNumbersArray = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!${config.sheetPhoneColumn}2:${config.sheetPhoneColumn}${config.sheetRange}`,
  });

  const namesArray = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!${config.sheetNameColumn}2:${config.sheetNameColumn}${config.sheetRange}`,
  });

  if (
    !namesArray.data.values ||
    !locationsArray.data.values ||
    !prevLocationsArray.data.values
  ) {
    console.log(
      "No data found: namesArray, locationsArray, prevLocationsArray, phoneNumbersArray (irrelevant)",
      namesArray.data.values,
      locationsArray.data.values,
      prevLocationsArray.data.values,
      phoneNumbersArray.data.values
    );
    return [];
  }
  const reportersObjArray: Reporter[] = [];
  for (let i = 0; i < namesArray.data.values.length; i++) {
    let phoneNumber = "";
    if (
      phoneNumbersArray &&
      phoneNumbersArray.data &&
      phoneNumbersArray.data.values &&
      phoneNumbersArray.data.values[i]
    ) {
      phoneNumber = phoneNumbersArray.data.values[i][0];
    }

    reportersObjArray.push({
      name: namesArray.data.values[i][0],
      location: locationsArray.data.values[i]
        ? locationsArray.data.values[i][0]
        : "",
      prevLocation: prevLocationsArray.data.values[i]
        ? prevLocationsArray.data.values[i][0]
        : "",
      phoneNumber,
    });
  }

  return reportersObjArray;
}

function getNumOfDaysBetweenDates(start: Date, end: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((start.getTime() - end.getTime()) / oneDay));
}

function colIdxToLetter(colIdx: number) {
  var temp,
    letter = "";
  while (colIdx > 0) {
    temp = (colIdx - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIdx = (colIdx - temp - 1) / 26;
  }
  return letter;
}

function letterToColumnIdx(letter: string) {
  var column = 0,
    length = letter.length;
  for (var i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

export async function getSheetsData() {
  console.log("Hello Sheet Shamer!");
  console.log(config);
  let jwtClient: Auth.JWT;
  let reporters: Reporter[] = [];
  try {
    jwtClient = await authorize();
    if (!jwtClient) {
      console.log("auth is null");
      return;
    }
    reporters = await getAllReporters(jwtClient);
  } catch (err) {
    console.log("Error in authorization:", err);
  }

  return reporters;
}

export async function getNonReporters(): Promise<Reporter[]> {
  const reporters = await getSheetsData();
  if (!reporters) {
    console.log("reporters is null");
    return [];
  }
  console.log("Number of reporters: ", reporters.length);
  const nonReporters = reporters.filter(
    (reporter) => !reporter.location && reporter.prevLocation
  );
  return nonReporters;
}
