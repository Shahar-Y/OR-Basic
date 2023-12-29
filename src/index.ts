import cron from "node-cron";
import { connectToWhatsapp } from "./whatsapp";
import WAWebJS, { Client } from "whatsapp-web.js";
import { config } from "./config";
import GMObjct from "../groupMessages.env.json";
import { google, Auth } from "googleapis";
import credentials from "../credentials.json";

export type GroupMessage = {
  groupId: string;
  groupName: string;
  message: string;
  regex: string;
};

const GMArray: GroupMessage[] = GMObjct.GMArray as GroupMessage[];

// ************************************************************ //

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

async function listMajors(jwtClient: Auth.JWT) {
  const sheets = google.sheets({ version: "v4", auth: jwtClient });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: "Sheet1!A1:B2",
  });
  const rows = res.data.values;
  console.log(rows);
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

async function main() {
  console.log("Hello Sheet Shamer!");
  let jwtClient: Auth.JWT;
  try {
    jwtClient = await authorize();
    if (!jwtClient) {
      console.log("auth is null");
      return;
    }
    await listMajors(jwtClient);
  } catch (err) {
    console.log("Error in authorization:", err);
  }

  // const whatsappClient: Client = await connectToWhatsapp();

  // // print date and time
  // console.log(new Date().toLocaleString());
  // await printGroups(whatsappClient);
  // for (const GM of GMArray) {
  //   console.log(GM);
  //   const groupChat = await whatsappClient.getChatById(GM.groupId);
  //   cron.schedule(GM.regex, async () => {
  //     console.log(new Date().toLocaleString());
  //     console.log(`sending message to ${GM.groupName} group`);
  //     // await chat.sendMessage("message from cron job");
  //     await groupChat.sendMessage(GM.message);
  //   });
  // }
}

main();

async function printGroups(whatsappClient: Client) {
  let chats: any = await whatsappClient.getChats();

  chats = chats.filter((chat: any) => chat.isGroup);

  // save chat id and name
  const shortChats = chats.map((chat: any) => {
    return {
      id: chat.id._serialized,
      name: chat.groupMetadata?.subject,
    };
  });

  console.log(shortChats);
}
