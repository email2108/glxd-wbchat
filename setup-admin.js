const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupAdmin() {
  try {
    // Thay thế bằng Telegram Chat ID thực của bạn
    const telegramChatId = process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID_HERE'
    
    if (telegramChatId === 'YOUR_TELEGRAM_CHAT_ID_HERE') {
      console.log('Vui lòng thiết lập TELEGRAM_CHAT_ID trong biến môi trường hoặc sửa file này')
      return
    }

    // Tìm hoặc tạo user
    let user = await prisma.user.findFirst({
      where: { telegramChatId: telegramChatId.toString() }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramChatId: telegramChatId.toString(),
          name: 'Admin_GLXD',
          role: 'USER'
        }
      })
      console.log('Đã tạo user mới:', user.id)
    }

    // Cập nhật vai trò thành ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    })

    console.log('✅ Đã thiết lập admin thành công!')
    console.log('Thông tin admin:')
    console.log('- ID:', updatedUser.id)
    console.log('- Name:', updatedUser.name)
    console.log('- Telegram Chat ID:', updatedUser.telegramChatId)
    console.log('- Role:', updatedUser.role)
    console.log('- Created at:', updatedUser.createdAt)

  } catch (error) {
    console.error('Lỗi:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdmin()