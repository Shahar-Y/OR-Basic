import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config = {
  dailyORRegex: process.env.RUNTIME_REGEX || "0 7 * * 0,1,2,3,4",
  chromePath: process.env.CHROME_PATH || "",
  testPhoneNumber: process.env.TEST_PHONE_NUMBER || "",
};

export { config };
