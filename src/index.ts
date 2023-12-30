// SHIT: Sheets Helper Improvised Tyrant

import cron from "node-cron";
import { connectToWhatsapp, runShamer } from "./whatsapp";
import { Client } from "whatsapp-web.js";
import GMObjct from "../groupMessages.env.json";
import { getNonReporters } from "./googleSheets";

export type GroupMessage = {
  groupId: string;
  groupName: string;
  message: string;
  regex: string;
  shamer?: string;
};

const GMArray: GroupMessage[] = GMObjct.GMArray as GroupMessage[];

async function main() {
  console.log("Last updated: 30-12-2023");
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

      if (GM.shamer) {
        runShamer(whatsappClient, groupChat, GM);
        return;
      }

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
