const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserInfo() {
  try {
    console.log('🔄 Đang cập nhật thông tin người dùng...');
    
    // Cập nhật thông tin admin của bạn
    const updatedUser = await prisma.user.update({
      where: { telegramChatId: '1800742978' },
      data: {
        username: 'trungtommy', // Username Telegram của bạn
        name: 'Trung Tommy',   // Tên đầy đủ
      }
    });
    
    console.log('✅ Đã cập nhật thông tin user:');
    console.log('- ID:', updatedUser.id);
    console.log('- Name:', updatedUser.name);
    console.log('- Username:', updatedUser.username);
    console.log('- Phone:', updatedUser.phone);
    console.log('- Telegram Chat ID:', updatedUser.telegramChatId);
    console.log('- Role:', updatedUser.role);
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật thông tin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserInfo();