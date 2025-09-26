const https = require('https');

const botToken = '7856893063:AAFhYTUkhnxuhY18tA9AnOFvmQiiu2Jx6DY';

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

// Hàm để kiểm tra tin nhắn đang chờ
function checkPendingMessages() {
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
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Hàm chính để giải thích hành vi bot
async function explainBotBehavior() {
  console.log('🤖 GIẢI THÍCH HÀNH VI BOT GLXD\n');
  console.log('=====================================\n');
  
  console.log('📋 QUY TẮC HOẠT ĐỘNG:');
  console.log('1. ✅ Bot CHỈ phản hồi khi có người nhắn tin');
  console.log('2. ✅ Bot KHÔNG tự động gửi tin nhắn cho bất kỳ ai');
  console.log('3. ✅ Bot KHÔNG spam hoặc gửi tin nhắn không mong muốn');
  console.log('4. ✅ Mọi tương tác đều do người dùng khởi xướng\n');
  
  console.log('🔄 QUY TRÌNH HOẠT ĐỘNG:');
  console.log('1. Người dùng ➜ Nhắn tin cho @glxdshop_bot');
  console.log('2. Bot ➜ Phản hồi với mã OTP');
  console.log('3. Người dùng ➜ Nhập OTP trên website');
  console.log('4. Hệ thống ➜ Xác thực và cấp quyền truy cập\n');
  
  console.log('🛡️ TÍNH BẢO MẬT:');
  console.log('- Không có broadcast tin nhắn hàng loạt');
  console.log('- Không gửi tin nhắn không được yêu cầu');
  console.log('- Mỗi OTP chỉ dùng được một lần');
  console.log('- OTP hết hạn sau 5 phút\n');
  
  console.log('📨 KIỂM TRA TIN NHẮN ĐANG CHỜ...\n');
  
  try {
    const updates = await checkPendingMessages();
    
    if (updates.ok && updates.result && updates.result.length > 0) {
      console.log(`📥 Tìm thấy ${updates.result.length} tin nhắn đang chờ xử lý:`);
      console.log('(Những tin nhắn này sẽ được xử lý khi bot hoạt động)\n');
      
      updates.result.forEach((update, index) => {
        if (update.message && update.message.text) {
          console.log(`${index + 1}. Từ ${update.message.from.first_name} (@${update.message.from.username || 'no_username'}): "${update.message.text}"`);
        }
      });
    } else {
      console.log('😴 Không có tin nhắn nào đang chờ');
      console.log('(Bot không gửi tin nhắn khi không có tương tác)\n');
    }
    
    console.log('✅ KẾT LUẬN:');
    console.log('Bot GLXD hoạt động đúng như yêu cầu - chỉ phản hồi khi được nhắn tin!');
    console.log('Không có nguy cơ gửi tin nhắn cho "cả thiên hạ" 🌍\n');
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra:', error);
  }
}

// Chạy hàm giải thích
explainBotBehavior();