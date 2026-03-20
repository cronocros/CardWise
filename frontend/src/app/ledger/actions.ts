'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { backendUrl, type CreatePaymentRequest } from '@/lib/cardwise-api'

export async function deletePayment(paymentId: number) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const response = await fetch(backendUrl(`/payments/${paymentId}`), {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  })

  if (!response.ok) {
    throw new Error('Failed to delete payment')
  }

  revalidatePath('/ledger')
  redirect('/cards')
}

export async function createPayment(request: CreatePaymentRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const response = await fetch(backendUrl('/payments'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    throw new Error('Failed to create payment')
  }

  revalidatePath('/ledger')
}
