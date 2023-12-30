import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config = {
  dailyORRegex: process.env.RUNTIME_REGEX || "0 7 * * 0,1,2,3,4",
  chromePath: process.env.CHROME_PATH || "",
  spreadsheetId: process.env.SPREADSHEET_ID || "",
  sheetName: process.env.SHEET_NAME || "Sheet1",
  sheetRange: process.env.SHEET_RANGE || "A1:B2",
};

export { config };
