import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config = {
  dailyORRegex: process.env.RUNTIME_REGEX || "0 7 * * 0,1,2,3,4",
  chromePath: process.env.CHROME_PATH || "",
  spreadsheetId: process.env.SPREADSHEET_ID || "",
  sheetName: process.env.SHEET_NAME || "Sheet1",
  sheetRange: process.env.SHEET_RANGE || "100",
  sheetNameColumn: process.env.SHEET_NAME_COLUMN || "B",
  sheetPhoneColumn: process.env.SHEET_PHONE_COLUMN || "C",
  sheetStartDate: process.env.SHEET_START_DATE || "2023-10-16",
  sheetStartDateColumn: process.env.SHEET_START_DATE_COLUMN || "F",
};

export { config };
