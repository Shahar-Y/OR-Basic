import WAWebJS, { Client, LocalAuth } from "whatsapp-web.js";
import { config } from "../config";
import qrt from "qrcode-terminal";
import { getNonReporters } from "./googleSheets";
import { GroupMessage } from "../src";

export async function connectToWhatsapp() {
  console.log("");
  console.log("*********************************************");
  console.log("connectToWhatsapp function called!");

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: "./data" }),
    puppeteer: {
      headless: true,
      executablePath: config.chromePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr: any) => {
    console.log("!!! QR RECEIVED. Please authenticate !!!\n", qr);
    qrt.generate(qr, { small: true });
  });

  client.on("ready", async () => {
    console.log("Whatsapp client is ready!");
  });

  client.on("message", async (msg: WAWebJS.Message) => {});
  // }

  await client.initialize();
  console.log("Client initialized!");
  return client;
}

export async function runShamer(
  whatsappClient: Client,
  groupChat: WAWebJS.Chat,
  GM: GroupMessage
) {
  const reporters = await getNonReporters();
  let text = "";
  let mentions = [];

  // Mention all reporters

  for (const reporter of reporters) {
    if (text.length !== 0) {
      text += ",\n";
    }
    if (reporter.phoneNumber) {
      const reporterNumber =
        "972" + reporter.phoneNumber.replace(/\D/g, "").substring(1).trim();
      const contact = (await whatsappClient.getContactById(
        `${reporterNumber}@c.us`
      )) as WAWebJS.Contact;

      mentions.push(contact);
      text += `${reporter.name} @${reporterNumber}`;
    } else {
      console.log("No phone number for: " + reporter.name);
      text += `${reporter.name}, `;
    }
  }
  if (text.length === 0) {
    await groupChat.sendMessage(
      "איני מאמין למראה API!!🤖😲\n כולם מילאו בהצלחה את הטופס!📝 \n יותר סביר שיש לי באג.\n בת אל תבדקי אותי בבקשה"
    );
    return;
  }
  await groupChat.sendMessage(GM.message);
  await groupChat.sendMessage(text, { mentions });
  return;
}
