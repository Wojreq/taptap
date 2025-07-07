const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const tmi = require('tmi.js');
const path = require('path');



const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static('public'));

let client = null;
let botSettings = null;

app.post('/start-bot', (req, res) => {
  const settings = req.body;

  if (!settings.twitch_token || !settings.twitch_nick || !settings.twitch_channel) {
    return res.status(400).json({ error: 'Brakuje wymaganych pól!' });
  }

  botSettings = settings;

  if (client) {
    client.disconnect();
  }

  client = new tmi.Client({
    identity: {
      username: botSettings.twitch_nick,
      password: botSettings.twitch_token
    },
    channels: [botSettings.twitch_channel]
  });

  client.connect()
    .then(() => {
      console.log('Bot połączony!');

client.on('message', (channel, userstate, message, self) => {
  if (self) return;

  const isBroadcaster = userstate.badges && userstate.badges.broadcaster === '1';
  if (!isBroadcaster) return;

  if (message.includes('https://instream.ly/')) {
    const parts = message.split('/');
    const lastPart = parts[parts.length - 1];
    const link = `https://instream.ly/${lastPart}`;

    const spamCount = botSettings.spam_count || 3;
    const spamDelay = botSettings.spam_delay || 1.0;

    let count = 0;
    const interval = setInterval(() => {
      if (count >= spamCount) {
        clearInterval(interval);
        return;
      }

      const messageTemplate = botSettings.bot_message || 'POLICE tapujcie widzowie {link}';
      const messageToSend = messageTemplate.replace('{link}', link);
      client.say(channel, messageToSend);
      count++;
    }, spamDelay * 1000);
  }
});



      res.json({ status: 'Bot uruchomiony!' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Błąd przy łączeniu bota' });
    });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});