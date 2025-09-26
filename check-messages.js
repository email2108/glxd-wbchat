const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const botToken = '7856893063:AAFhYTUkhnxuhY18tA9AnOFvmQiiu2Jx6DY';

// Hàm để lấy các tin nhắn đang chờ
async function getPendingMessages() {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${botToken}/getUpdates`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Hàm để gửi tin nhắn
async function sendMessage(chatId, text) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Hàm để tạo OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hàm chính để xử lý tin nhắn
async function processMessages() {
  try {
    console.log('Đang kiểm tra tin nhắn đang chờ...');
    
    const updates = await getPendingMessages();
    console.log('Phản hồi từ Telegram:', JSON.stringify(updates, null, 2));
    
    if (updates.ok && updates.result && updates.result.length > 0) {
      console.log(`Tìm thấy ${updates.result.length} tin nhắn đang chờ`);
      
      for (const update of updates.result) {
        if (update.message && update.message.chat && update.message.text) {
          const chatId = update.message.chat.id;
          const text = update.message.text;
          
          console.log(`Xử lý tin nhắn từ ${chatId}: "${text}"`);
          
          // Tạo user nếu chưa tồn tại
          let user = await prisma.user.findFirst({
            where: { telegramChatId: chatId.toString() }
          });
          
          if (!user) {
            user = await prisma.user.create({
              data: {
                telegramChatId: chatId.toString(),
                name: `User_${chatId}`,
              }
            });
            console.log(`Đã tạo user mới: ${user.id}`);
          }
          
          // Tạo và gửi OTP
          const otp = generateOTP();
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
          
          // Lưu OTP vào database
          await prisma.oTP.create({
            data: {
              code: otp,
              type: 'TELEGRAM',
              sentTo: chatId.toString(),
              userId: user.id,
              expiresAt,
            }
          });
          
          // Gửi OTP cho user
          const message = `👋 Xin chào ${telegramUser.first_name || 'bạn'}!\n\n🔐 *Mã GLXD OTP của bạn*: ${otp}\n\n⏰ Mã có hiệu lực trong 5 phút\n\n🛡️ Bot chỉ phản hồi khi bạn nhắn tin, không tự gửi cho bất kỳ ai.\n\n🌐 Vui lòng nhập mã này tại: http://localhost:3000`;
          
          const sendResult = await sendMessage(chatId, message);
          console.log('Kết quả gửi tin nhắn:', sendResult);
          
          console.log(`Đã gửi OTP ${otp} đến ${chatId}`);
        }
      }
    } else {
      console.log('Không có tin nhắn đang chờ');
    }
    
  } catch (error) {
    console.error('Lỗi khi xử lý tin nhắn:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy hàm xử lý
processMessages();