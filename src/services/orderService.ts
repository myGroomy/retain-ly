import { supabase } from './supabaseClient'
import type { Order, PaginatedResponse } from '@/types'

export async function createOrder(
  order: Omit<Order, 'id' | 'created_at'>,
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_id: order.customer_id,
      order_date: order.order_date,
      channel: order.channel,
      raw_phone_input: order.raw_phone_input,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getOrdersByCustomer(
  customerId: string,
  page = 0,
  pageSize = 20,
): Promise<PaginatedResponse<Order>> {
  const { data, count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('customer_id', customerId)
    .order('order_date', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) throw error

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export async function getRecentOrders(
  page = 0,
  pageSize = 20,
): Promise<PaginatedResponse<Order>> {
  const { data, count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('order_date', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) throw error

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}
