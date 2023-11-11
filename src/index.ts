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

  // print date and time
  console.log(new Date().toLocaleString());
  await printGroups(whatsappClient);
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
