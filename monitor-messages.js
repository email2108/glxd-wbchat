const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const botToken = '7856893063:AAFhYTUkhnxuhY18tA9AnOFvmQiiu2Jx6DY';
let lastUpdateId = 702244950; // Bắt đầu từ update ID cuối cùng

// Hàm để lấy các tin nhắn mới
async function getNewMessages() {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
    
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

// Hàm để xử lý tin nhắn
async function processMessage(message) {
  try {
    const chatId = message.chat.id;
    const text = message.text;
    
    console.log(`📨 Tin nhắn mới từ ${chatId}: "${text}"`);
    
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
      console.log(`✅ Đã tạo user mới: ${user.id}`);
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
    const responseText = `👋 Xin chào ${message.from.first_name || 'bạn'}!\n\n🔐 *Mã GLXD OTP của bạn*: ${otp}\n\n⏰ Mã có hiệu lực trong 5 phút\n\n🛡️ Bot chỉ phản hồi khi bạn nhắn tin, không tự gửi cho bất kỳ ai.\n\n🌐 Vui lòng nhập mã này tại: http://localhost:3000`;
    
    const sendResult = await sendMessage(chatId, responseText);
    
    if (sendResult.ok) {
      console.log(`✅ Đã gửi OTP ${otp} đến ${chatId}`);
    } else {
      console.log(`❌ Không thể gửi OTP đến ${chatId}: ${sendResult.description}`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi xử lý tin nhắn:', error);
  }
}

// Hàm giám sát tin nhắn
async function monitorMessages() {
  try {
    console.log('🔍 Đang kiểm tra tin nhắn mới...');
    
    const updates = await getNewMessages();
    
    if (updates.ok && updates.result && updates.result.length > 0) {
      console.log(`📥 Tìm thấy ${updates.result.length} tin nhắn mới`);
      
      for (const update of updates.result) {
        // Cập nhật lastUpdateId
        lastUpdateId = update.update_id;
        
        // Xử lý tin nhắn văn bản
        if (update.message && update.message.text) {
          await processMessage(update.message);
        }
      }
    } else {
      console.log('😴 Không có tin nhắn mới');
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi giám sát tin nhắn:', error);
  }
}

// Hàm chính để chạy liên tục
async function startMonitoring() {
  console.log('🚀 Bắt đầu giám sát tin nhắn Telegram...');
  console.log('💡 Gửi tin nhắn bất kỳ đến @glxdshop_bot để nhận mã OTP');
  console.log('⏹️  Nhấn Ctrl+C để dừng');
  
  // Giám sát liên tục mỗi 3 giây
  setInterval(monitorMessages, 3000);
}

// Chạy giám sát
startMonitoring();