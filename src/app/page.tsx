'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageCircle, Shield, Clock, CheckCircle, Gift, ExternalLink } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function Home() {
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [showReferral, setShowReferral] = useState(false)
  
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref)
      setShowReferral(true)
    }
  }, [searchParams])

  const handleSendOTP = async () => {
    setIsLoading(true)
    setStatus('sending')
    setMessage('Đang gửi mã OTP...')

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'telegram',
          contact: 'pending', // Will be handled by webhook
          referralCode: referralCode || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOtpSent(true)
        setStatus('sent')
        setMessage('Vui lòng nhắn tin cho bot @glxdshop_bot để nhận mã OTP!')
      } else {
        setStatus('error')
        setMessage(data.message || 'Không thể gửi mã OTP')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Lỗi kết nối, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setMessage('Vui lòng nhập mã OTP 6 số')
      setStatus('error')
      return
    }

    setIsLoading(true)
    setStatus('verifying')
    setMessage('Đang xác thực mã OTP...')

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'telegram',
          contact: 'pending', // Will be handled by webhook
          code: otpCode,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage('Xác thực thành công! Đang chuyển hướng...')
        
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          window.location.href = data.role === 'ADMIN' ? '/admin' : '/dashboard'
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Mã OTP không hợp lệ hoặc đã hết hạn')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Lỗi kết nối, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
      case 'verifying':
        return <Clock className="w-4 h-4 animate-spin" />
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <Shield className="w-4 h-4 text-red-500" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'error':
        return 'destructive'
      case 'success':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="relative w-20 h-20 mx-auto">
            <img
              src="/logo.svg"
              alt="GLXD Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Chào mừng đến với GLXD
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Xác thực OTP an toàn qua Telegram
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Xác thực OTP qua Telegram
            </CardTitle>
            <CardDescription>
              Nhắn tin cho bot để nhận mã OTP xác thực
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                    Nhắn tin cho bot Telegram:
                  </p>
                  <a
                    href="https://t.me/glxdshop_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium text-lg"
                  >
                    @glxdshop_bot
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                    Bot sẽ tự động gửi mã OTP cho bạn
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <Alert variant={getStatusColor()}>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <AlertDescription>{message}</AlertDescription>
                </div>
              </Alert>
            )}

            {!otpSent ? (
              <Button
                onClick={handleSendOTP}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Đang gửi...' : 'Bắt đầu xác thực'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Mã OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nhập mã OTP bạn nhận được từ Telegram
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otpCode.length !== 6}
                    className="flex-1"
                  >
                    {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOtpSent(false)
                      setOtpCode('')
                      setStatus('idle')
                      setMessage('')
                    }}
                    disabled={isLoading}
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {showReferral && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Gift className="w-5 h-5" />
                Được giới thiệu bởi bạn bè!
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-300">
                Bạn đang sử dụng mã giới thiệu: <span className="font-mono font-bold">{referralCode}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 dark:text-green-300">
                Hoàn tất xác thực để nhận ưu đãi đặc biệt!
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center space-y-2">
          <Badge variant="secondary" className="text-xs">
            🔒 Bảo mật với Telegram
          </Badge>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Chỉ cần nhắn tin cho bot, không cần nhập Chat ID
          </p>
        </div>
      </div>
    </div>
  )
}