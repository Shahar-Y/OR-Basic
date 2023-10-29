import cron from "node-cron";
import { connectToWhatsapp } from "./whatsapp";
import WAWebJS, { Client } from "whatsapp-web.js";
import { config } from "./config";
import GMObjct from "../groupMessages.env.json";

export type GroupMessage = {
  groupId: string;
  groupName: string;
  message: string;
  regex: string;
};

const GMArray: GroupMessage[] = GMObjct.GMArray as GroupMessage[];
console.log(GMArray);

async function main() {
  console.log("Hello World");

  const whatsappClient: Client = await connectToWhatsapp();

  //   const WAContact: WAWebJS.ContactId = (await whatsappClient.getNumberId(
  //     `972${config.testPhoneNumber.substring(1).trim()}@c.us`
  //   )) as WAWebJS.ContactId;

  //   const chat = await whatsappClient.getChatById(WAContact._serialized);
  // print date and time
  console.log(new Date().toLocaleString());
  await getGroups(whatsappClient);
  for (const GM of GMArray) {
    console.log(GM);
    const groupChat = await whatsappClient.getChatById(GM.groupId);
    cron.schedule(GM.regex, async () => {
      console.log(new Date().toLocaleString());
      console.log(`sending message to ${GM.groupName} group`);
      // await chat.sendMessage("message from cron job");
      await groupChat.sendMessage(GM.message);
    });
  }
}

main();

async function getGroups(whatsappClient: Client) {
  let chats: WAWebJS.Chat[] = await whatsappClient.getChats();

  chats = chats.filter((chat) => chat.isGroup);

  console.log(chats);
}
