'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { backendUrl } from '@/lib/cardwise-api'

export async function updateCardAlias(userCardId: number, nickname: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const response = await fetch(backendUrl(`/my-cards/${userCardId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ cardNickname: nickname })
  })

  if (!response.ok) {
    throw new Error('Failed to update card alias')
  }

  revalidatePath('/cards')
}

export async function deleteCard(userCardId: number) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const response = await fetch(backendUrl(`/my-cards/${userCardId}`), {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  })

  if (!response.ok) {
    throw new Error('Failed to delete card')
  }

  revalidatePath('/cards')
  redirect('/cards')
}
