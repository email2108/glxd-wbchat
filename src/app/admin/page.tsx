'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, MessageSquare, TrendingUp, Shield, Settings, LogOut, Bell, Edit, Phone, AtSign } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  name: string
  username: string | null
  phone: string | null
  email: string | null
  telegramChatId: string | null
  role: string
  createdAt: string
}

interface OTP {
  id: string
  code: string
  type: string
  sentTo: string
  used: boolean
  createdAt: string
  expiresAt: string
  user: User
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [otps, setOtps] = useState<OTP[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOTPs: 0,
    activeUsers: 0,
    todayOTPs: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // State for edit modal
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editPhone, setEditPhone] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [usersRes, otpsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/otps'),
        fetch('/api/admin/stats')
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (otpsRes.ok) {
        const otpsData = await otpsRes.json()
        setOtps(otpsData.otps || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats || stats)
      }
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard')
      console.error('Dashboard data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendBroadcast = async () => {
    const message = prompt('Nhập tin nhắn broadcast:')
    if (!message) return

    try {
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      if (response.ok) {
        alert('Tin nhắn đã được gửi thành công!')
      } else {
        alert('Không thể gửi tin nhắn')
      }
    } catch (err) {
      alert('Lỗi khi gửi tin nhắn')
    }
  }

  const handlePromoteUser = async (telegramChatId: string, currentRole: string) => {
    const targetRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    const confirmMessage = `Bạn có chắc muốn thay đổi vai trò của người dùng ${telegramChatId} thành ${targetRole}?`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const response = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramChatId: telegramChatId,
          targetRole: targetRole
        })
      })

      if (response.ok) {
        alert(`Đã cập nhật vai trò thành ${targetRole}!`)
        // Refresh the user list
        fetchDashboardData()
      } else {
        alert('Không thể cập nhật vai trò')
      }
    } catch (err) {
      alert('Lỗi khi cập nhật vai trò')
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditPhone(user.phone || '')
    setEditUsername(user.username || '')
    setIsEditModalOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    setIsUpdating(true)
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          phone: editPhone,
          username: editUsername
        })
      })

      if (response.ok) {
        alert('Đã cập nhật thông tin người dùng thành công!')
        setIsEditModalOpen(false)
        // Refresh the user list
        fetchDashboardData()
      } else {
        alert('Không thể cập nhật thông tin người dùng')
      }
    } catch (err) {
      alert('Lỗi khi cập nhật thông tin người dùng')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admin Dashboard - GLXD
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleSendBroadcast}>
                <Bell className="h-4 w-4 mr-2" />
                Broadcast
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Tổng số người dùng</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng OTP</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOTPs}</div>
              <p className="text-xs text-muted-foreground">Tổng mã OTP đã gửi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users Hoạt động</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Người dùng hoạt động</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OTP Hôm nay</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOTPs}</div>
              <p className="text-xs text-muted-foreground">OTP gửi hôm nay</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="otps">OTP Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý Users</CardTitle>
                <CardDescription>
                  Danh sách tất cả người dùng trong hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Telegram</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.id}</TableCell>
                        <TableCell>
                          {user.username ? (
                            <span className="text-blue-600">@{user.username}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          {user.phone ? (
                            <span className="text-green-600">{user.phone}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{user.telegramChatId || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.telegramChatId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePromoteUser(user.telegramChatId!, user.role)}
                              >
                                {user.role === 'ADMIN' ? 'Hủy ADMIN' : 'Cấp ADMIN'}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="otps">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử OTP</CardTitle>
                <CardDescription>
                  Nhật ký tất cả mã OTP đã được gửi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sent To</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otps.map((otp) => (
                      <TableRow key={otp.id}>
                        <TableCell className="font-mono">{otp.code}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{otp.type}</Badge>
                        </TableCell>
                        <TableCell>{otp.sentTo}</TableCell>
                        <TableCell>{otp.user.name}</TableCell>
                        <TableCell>
                          <Badge variant={otp.used ? 'default' : 'secondary'}>
                            {otp.used ? 'Used' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(otp.createdAt).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          {new Date(otp.expiresAt).toLocaleString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt hệ thống</CardTitle>
                <CardDescription>
                  Quản lý cài đặt và cấu hình hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Telegram Bot</h3>
                    <p className="text-sm text-gray-600">
                      Bot: @glxdshop_bot<br />
                      Status: <Badge variant="outline">Active</Badge>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Database</h3>
                    <p className="text-sm text-gray-600">
                      Type: SQLite<br />
                      Status: <Badge variant="outline">Connected</Badge>
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Cập nhật cài đặt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa thông tin người dùng</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={editingUser.id}
                  disabled
                  className="font-mono text-xs"
                />
              </div>
              
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingUser.name}
                  disabled
                />
              </div>
              
              <div>
                <Label htmlFor="username">Username (@)</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Nhập username (không bao gồm @)"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="telegram">Telegram Chat ID</Label>
                <Input
                  id="telegram"
                  value={editingUser.telegramChatId || ''}
                  disabled
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleUpdateUser}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}