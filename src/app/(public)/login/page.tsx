'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import Image from 'next/image'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
      // 成功時はリダイレクトされるので何もしない
    } catch (err) {
      setError('ログイン処理中にエラーが発生しました')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await signup(formData)
      if (result?.error) {
        setError(result.error)
      }
      if (result?.success) {
        setSuccess(result.success)
      }
    } catch (err) {
      setError('アカウント作成中にエラーが発生しました')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image
            src="/assets/logo.svg"
            alt="Bike Manager Logo"
            width={64}
            height={64}
            className="mx-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            駐輪場管理システム
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' 
              ? 'ログインして管理システムにアクセスしてください'
              : '新しい管理者アカウントを作成します'}
          </p>
        </div>

        <form className="mt-8 space-y-6" action={mode === 'login' ? handleLogin : handleSignup}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? "current-password" : "new-password"}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading 
                ? "処理中..." 
                : mode === 'login' 
                  ? "ログイン" 
                  : "アカウント作成"}
            </button>
          </div>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <button 
                type="button" 
                onClick={() => setMode('signup')}
                className="text-blue-600 hover:text-blue-800"
              >
                アカウントをお持ちでない場合はこちら
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-800"
              >
                既にアカウントをお持ちの場合はこちら
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}