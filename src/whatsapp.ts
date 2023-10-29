import WAWebJS, { Client, LocalAuth } from "whatsapp-web.js";
import { config } from "./config";
import qrt from "qrcode-terminal";

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
