require("dotenv").config();
const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");

const WEB_APP_URL = "https://xxdondi.dev/?data=";

const bot = new Telegraf(process.env.BOT_TOKEN);

const objectToBase64Json = (object) => {
  const json = JSON.stringify(object);
  const buffer = Buffer.from(json);
  return buffer.toString("base64");
};

bot.start((ctx) =>
  ctx.reply("Hello! Forward me a videomessage and let's record your reaction")
);

bot.on(message("video_note"), (ctx) => {
  bot.telegram
    .getFileLink(ctx.message.video_note.file_id)
    .then((fileLink) => {
      const finalUrl = WEB_APP_URL + objectToBase64Json({ link: fileLink });
      ctx.reply("Click React to get started :) ", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "React",
                web_app: {
                  url: finalUrl,
                },
              },
            ],
          ],
        },
      });
    })
    .catch(() => ctx.reply("Something went wrong, sorry!"));
});

bot.on(message("video"), (ctx) => {
  bot.telegram
    .getFileLink(ctx.message.video.file_id)
    .then((fileLink) => {
      const finalUrl = WEB_APP_URL + objectToBase64Json({ link: fileLink });
      ctx.reply("Click React to get started :) ", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "React",
                web_app: {
                  url: finalUrl,
                },
              },
            ],
          ],
        },
      });
    })
    .catch(() => ctx.reply("Something went wrong, sorry!"));
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
