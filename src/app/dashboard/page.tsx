'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  User, 
  Shield, 
  Gift, 
  Copy, 
  LogOut, 
  Settings, 
  TrendingUp,
  MessageSquare,
  Mail,
  Phone,
  Send
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UserProfile {
  id: string
  name: string
  email: string | null
  phone: string | null
  telegramChatId: string | null
  role: string
  createdAt: string
}

interface Referral {
  id: string
  code: string
  status: string
  earnings: number
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
}

export default function UserDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [otps, setOtps] = useState<OTP[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const [userRes, referralsRes, otpsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/referrals'),
        fetch('/api/user/otps')
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData.user)
      }

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json()
        setReferrals(referralsData.referrals || [])
      }

      if (otpsRes.ok) {
        const otpsData = await otpsRes.json()
        setOtps(otpsData.otps || [])
      }
    } catch (err) {
      setError('Không thể tải dữ liệu người dùng')
      console.error('User data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReferral = async () => {
    try {
      const response = await fetch('/api/user/referrals/create', {
        method: 'POST'
      })

      if (response.ok) {
        await fetchUserData() // Refresh data
      } else {
        alert('Không thể tạo mã giới thiệu')
      }
    } catch (err) {
      alert('Lỗi khi tạo mã giới thiệu')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getReferralLink = (code: string) => {
    return `${window.location.origin}/?ref=${code}`
  }

  const handleLogout = () => {
    window.location.href = '/'
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Lỗi xác thực</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">Vui lòng đăng nhập lại</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
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
                User Dashboard - GLXD
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                {user.role}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
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

        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Chào mừng, {user.name}!
            </CardTitle>
            <CardDescription>
              Quản lý tài khoản và theo dõi hoạt động của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Telegram</Label>
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user.telegramChatId || 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="referrals">Giới thiệu</TabsTrigger>
            <TabsTrigger value="activity">Hoạt động</TabsTrigger>
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Mã giới thiệu
                  </CardTitle>
                  <CardDescription>
                    Tạo và quản lý mã giới thiệu của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleCreateReferral} className="w-full">
                    <Gift className="h-4 w-4 mr-2" />
                    Tạo mã giới thiệu mới
                  </Button>
                  
                  {referrals.length > 0 && (
                    <div className="space-y-3">
                      {referrals.map((referral) => (
                        <div key={referral.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {referral.code}
                            </span>
                            <Badge variant={
                              referral.status === 'ACTIVE' ? 'default' :
                              referral.status === 'COMPLETED' ? 'secondary' : 'outline'
                            }>
                              {referral.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Thu nhập: ${referral.earnings.toFixed(2)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(getReferralLink(referral.code))}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Thống kê giới thiệu
                  </CardTitle>
                  <CardDescription>
                    Tổng quan về hiệu quả giới thiệu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {referrals.length}
                        </div>
                        <div className="text-sm text-gray-600">Tổng mã</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${referrals.reduce((sum, r) => sum + r.earnings, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Tổng thu nhập</div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      {copied && 'Đã sao chép liên kết!'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Lịch sử OTP
                </CardTitle>
                <CardDescription>
                  Nhật ký các mã OTP đã sử dụng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã OTP</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Gửi đến</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thời gian</TableHead>
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
                        <TableCell>
                          <Badge variant={otp.used ? 'default' : 'secondary'}>
                            {otp.used ? 'Đã sử dụng' : 'Còn hiệu lực'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(otp.createdAt).toLocaleString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài đặt hồ sơ
                </CardTitle>
                <CardDescription>
                  Cập nhật thông tin cá nhân của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ tên</Label>
                      <Input id="name" defaultValue={user.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram Chat ID</Label>
                      <Input id="telegram" defaultValue={user.telegramChatId || ''} />
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Cập nhật hồ sơ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}