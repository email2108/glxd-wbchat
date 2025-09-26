const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const botToken = '7856893063:AAFhYTUkhnxuhY18tA9AnOFvmQiiu2Jx6DY';
const chatId = '1800742978'; // Chat ID của bạn

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

// Hàm chính
async function main() {
  try {
    console.log('🔐 Gửi mã OTP trực tiếp đến bạn...');
    
    // Tạo user nếu chưa tồn tại
    let user = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramChatId: chatId.toString(),
          name: 'Admin_GLXD',
        }
      });
      console.log('✅ Đã tạo user mới:', user.id);
    }
    
    // Tạo OTP
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
    
    // Gửi OTP
    const message = `👋 Xin chào Admin!\n\n🔐 *Mã GLXD OTP của bạn*: ${otp}\n\n⏰ Mã có hiệu lực trong 5 phút\n\n🛡️ Bot chỉ phản hồi khi bạn nhắn tin, không tự gửi cho bất kỳ ai.\n\n🌐 Vui lòng nhập mã này tại: http://localhost:3000`;
    
    const result = await sendMessage(chatId, message);
    
    if (result.ok) {
      console.log('✅ Đã gửi OTP thành công!');
      console.log(`📱 Mã OTP của bạn là: ${otp}`);
      console.log('⏰ Mã có hiệu lực trong 5 phút');
      console.log('🌐 Vui lòng truy cập http://localhost:3000 và nhập mã OTP để đăng nhập');
    } else {
      console.log('❌ Không thể gửi OTP:', result.description);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy hàm chính
main();