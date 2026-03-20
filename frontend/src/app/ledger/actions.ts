'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
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
  
  const payload = await response.json()
  revalidatePath('/ledger')
  return { tierChanged: payload.data?.tierChanged, newTierName: payload.data?.newTierName }
}

export async function updatePayment(paymentId: number, request: CreatePaymentRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const response = await fetch(backendUrl(`/payments/${paymentId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    throw new Error('Failed to update payment')
  }

  const payload = await response.json()
  revalidatePath('/ledger')
  return { tierChanged: payload.data?.tierChanged, newTierName: payload.data?.newTierName }
}
