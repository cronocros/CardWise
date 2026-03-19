'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // For testing/demonstration. Remove in production!
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Simple mock handling since this is a UI prototype
  if (!email || !password) {
    redirect('/login?error=Invalid email or password')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=Could not sign up user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
