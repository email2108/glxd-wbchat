const https = require('https');

const botToken = '7856893063:AAFhYTUkhnxuhY18tA9AnOFvmQiiu2Jx6DY';
const chatId = '1800742978'; // Chat ID của bạn

// Hàm gửi tin nhắn trực tiếp
function sendDirectMessage(chatId, text) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
    
    console.log(`Đang gửi tin nhắn đến ${chatId}: ${text}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Kết quả:', JSON.stringify(result, null, 2));
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Hàm kiểm tra tin nhắn mới
function checkNewMessages() {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=-1`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Tin nhắn mới:', JSON.stringify(result, null, 2));
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Hàm chính
async function main() {
  try {
    console.log('=== KIỂM TRA TRẠNG THÁI BOT ===');
    
    // Kiểm tra tin nhắn mới
    console.log('\n1. Kiểm tra tin nhắn mới...');
    await checkNewMessages();
    
    // Thử gửi tin nhắn test
    console.log('\n2. Thử gửi tin nhắn test...');
    const testResult = await sendDirectMessage(chatId, '🤖 Bot GLXD đang hoạt động! Vui lòng trả lời tin nhắn này để nhận mã OTP.');
    
    if (testResult.ok) {
      console.log('✅ Tin nhắn test đã được gửi thành công!');
      console.log('📱 Vui lòng kiểm tra Telegram và trả lời tin nhắn từ bot.');
    } else {
      console.log('❌ Không thể gửi tin nhắn:', testResult.description);
      
      if (testResult.error_code === 403) {
        console.log('🔒 Bot vẫn bị chặn. Vui lòng bỏ chặn bot trên Telegram.');
        console.log('📱 Hướng dẫn:');
        console.log('   1. Mở Telegram');
        console.log('   2. Tìm @glxdshop_bot');
        console.log('   3. Nhấp vào profile bot');
        console.log('   4. Nhấp vào biểu tượng 3 chấm (⋮)');
        console.log('   5. Chọn "Unblock" hoặc "Bỏ chặn"');
      }
    }
    
  } catch (error) {
    console.error('Lỗi:', error);
  }
}

// Chạy hàm chính
main();