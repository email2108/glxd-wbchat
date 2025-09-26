const https = require('https');

const botToken = '7856893063:AAFhYTUkhnxuhY18tA9AnOFvmQiiu2Jx6DY';

// Bạn cần cung cấp URL công khai của bạn
// Nếu bạn đang dùng localhost, bạn cần dùng ngrok hoặc similar service
const webhookUrl = 'https://your-domain.com/api/telegram/webhook';

const setWebhook = async () => {
  const url = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  }).on('error', (err) => {
    console.error('Error:', err);
  });
};

setWebhook();