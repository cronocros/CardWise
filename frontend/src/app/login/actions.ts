'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('이메일과 비밀번호를 입력해 주세요.'))
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent('이메일 또는 비밀번호가 올바르지 않습니다.'))
  }

  revalidatePath('/', 'layout')
  redirect('/mobile')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // If email confirmation is required, Supabase returns user but no session
  if (data.user && !data.session) {
    redirect('/login?message=' + encodeURIComponent('가입 완료! 이메일 인증 링크를 확인해 주세요.'))
  }

  revalidatePath('/', 'layout')
  redirect('/mobile')
}

export async function signInWithOAuth(provider: 'google' | 'kakao' | 'naver' | 'apple') {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }
}
