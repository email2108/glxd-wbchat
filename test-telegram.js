const https = require('https');

const botToken = '7856893063:AAFhYTUkhnxuhY18tA9AnOFvmQiiu2Jx6DY';

// Kiểm tra các tin nhắn đang chờ
const getUpdates = async () => {
  const url = `https://api.telegram.org/bot${botToken}/getUpdates`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Updates:', JSON.parse(data));
    });
  }).on('error', (err) => {
    console.error('Error:', err);
  });
};

// Gửi tin nhắn test
const sendMessage = (chatId, text) => {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Message sent:', JSON.parse(data));
    });
  }).on('error', (err) => {
    console.error('Error:', err);
  });
};

// Kiểm tra các cập nhật
getUpdates();

// Gửi tin nhắn test (thay YOUR_CHAT_ID bằng chat ID thực)
// sendMessage('YOUR_CHAT_ID', 'Bot đang hoạt động!');