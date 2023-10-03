const { Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const colors = require('colors');
const fs = require('fs');
const ytdl = require('ytdl-core');

const client = new Client({ 
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    },
    authStrategy: new LocalAuth({ clientId: "client" })
});
const config = require('./src/config/config.json');

client.on('qr', (qr) => {
    console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Scan the QR below : `);
    qrcode.generate(qr, { small: true });
});
 
client.on('ready', () => {
    console.clear();
    const consoleText = './src/config/console.txt';
    fs.readFile(consoleText, 'utf-8', (err, data) => {
        if (err) {
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Console Text not found!`.yellow);
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} is Already!`.green);
        } else {
            console.log(data.green);
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} is Already!`.green);
        }
    })
});

client.on('message', async (message) => {
    let url = message.body.split(' ')[1];
    let isGroups = message.from.endsWith('@g.us') ? true : false;

    async function detailYouTube(url) {
        client.sendMessage(message.from, '*❲⏳❳* *කරුණාකර මදක් රැදීසිටින්න.....*');
        try {
            let info = await ytdl.getInfo(url);
            let data = {
                "channel": {
                    "name": info.videoDetails.author.name,
                    "user": info.videoDetails.author.user,
                    "channelUrl": info.videoDetails.author.channel_url,
                    "userUrl": info.videoDetails.author.user_url,
                    "verified": info.videoDetails.author.verified,
                    "subscriber": info.videoDetails.author.subscriber_count
                },
                "video": {
                    "title": info.videoDetails.title,
                    "description": info.videoDetails.description,
                    "lengthSeconds": info.videoDetails.lengthSeconds,
                    "videoUrl": info.videoDetails.video_url,
                    "publishDate": info.videoDetails.publishDate,
                    "viewCount": info.videoDetails.viewCount
                }
            }
            client.sendMessage(message.from, `*🔖 චැනලයෙහි තොරතුරු*\n❲●❳ *චැනලයේ නම* : *${data.channel.name}*\n❲⚡❳ *බාවිත කල පුද්ගලයා* : *${data.channel.user}*\n❲🔱❳ *ආරක්ෂාව* : *${data.channel.verified}*\n❲🏷️❳ *චැනලය* : *${data.channel.channelUrl}*\n❲🍃❳ *සබ්ස්ක්‍රයිබර්ස්* : *${data.channel.subscriber}*\n *👸SAKURA-YT-MD...*`);
            client.sendMessage(message.from, `*🌿 වීඩියෝවෙහි තොරතුරු*\n❲🔖❳ *මාතෘකාව* : *${data.video.title}*\n❲🕧❳ *කාලසීමාව* : *${data.video.lengthSeconds}*\n❲🖇️❳ *URL ලින්කුව* : *${data.video.videoUrl}*\n❲🍭❳ *ගීතය ජනසතු කල දිනය* : *${data.video.publishDate}*\n❲👀❳ *නැරඹුම් වාර* : *${data.video.viewCount}*\n *👸SAKURA-YT-MD...*`)
            client.sendMessage(message.from, '📩 *ගීතය සාර්ථකව ලබාදී ඇත...*');
        } catch (err) {
            console.log(err);
            client.sendMessage(message.from, '❌ *ගීතය ලබාදීමට නොහැකි විය....*');
        }
    }

    async function downloadYouTube(url, format, filter) {
        client.sendMessage(message.from, '*❲⏳❳* *කරුණාකර මදක් රැදීසිටින්න....*\n *📩Download by _SAKURA-YT-MD_..*');
        let timeStart = Date.now();
        try {
            let info = await ytdl.getInfo(url);
            let data = {
                "channel": {
                    "name": info.videoDetails.author.name,
                    "user": info.videoDetails.author.user,
                    "channelUrl": info.videoDetails.author.channel_url,
                    "userUrl": info.videoDetails.author.user_url,
                    "verified": info.videoDetails.author.verified,
                    "subscriber": info.videoDetails.author.subscriber_count
                },
                "video": {
                    "title": info.videoDetails.title,
                    "description": info.videoDetails.description,
                    "lengthSeconds": info.videoDetails.lengthSeconds,
                    "videoUrl": info.videoDetails.video_url,
                    "publishDate": info.videoDetails.publishDate,
                    "viewCount": info.videoDetails.viewCount
                }
            }
            ytdl(url, { filter: filter, format: format, quality: 'highest' }).pipe(fs.createWriteStream(`./src/database/download.${format}`)).on('finish', async () => {
                const media = await MessageMedia.fromFilePath(`./src/database/download.${format}`);
                let timestamp = Date.now() - timeStart;
                media.filename = `${config.filename.mp3}.${format}`;
                await client.sendMessage(message.from, media, { sendMediaAsDocument: true });
                client.sendMessage(message.from, `❲🔖❳ *මාතෘකාව* : *${data.video.title}*\n❲🌿❳ *චැනලය* : *${data.channel.user}*\n❲👀❳ *නැරඹුම් වාර* : *${data.video.viewCount}*\n❲⚖️❳ *කාලසීමාව* : *${timestamp}*`);
                client.sendMessage(message.from, '*📩 *ගීතය සාර්ථකව ලබාදී ඇත...*');
            });
        } catch (err) {
            console.log(err);
            client.sendMessage(message.from, '*❌ *ගීතය ලබාදීමට නොහැකි විය....*');
        }
    }

    if ((isGroups && config.groups) || isGroups) return;
    if (message.body == `${config.prefix}help`) return client.sendMessage(message.from, `*${config.name}*\n\n[🎥] : *${config.prefix}video <youtube-url>*\n[🎧] : *${config.prefix}audio <youtube-url>*\n\n*Example :*\n${config.prefix}audio https://youtu.be`);
    if (url == undefined) return client.sendMessage(message.from, '*🔖 කරුණාකර නිවැරදි _URL_ ඇතුලත් කරන්න..*');
    if (!ytdl.validateURL(url)) return client.sendMessage(message.from, '*🔖 නිවැරැදි _URL_ ඇතුලත් කරන්න..*');
    if (message.body.startsWith(`${config.prefix}audio`)) {
        downloadYouTube(url, 'mp3', 'Only Audio');
    } else if (message.body.startsWith(`${config.prefix}video`)) {
        downloadYouTube(url, 'mp4', 'audioandvideo');
    } else if (message.body.startsWith(`${config.prefix}detail`)) {
        detailYouTube(url);
    }
});

client.initialize();
