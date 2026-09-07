import { supabase } from './supabaseClient'
import { normalizePhone } from '@/utils/normalizePhone'
import type { Customer, CustomerWithStats, PaginatedResponse } from '@/types'

export async function searchCustomers(
  query: string,
  page = 0,
  pageSize = 20,
): Promise<PaginatedResponse<Customer>> {
  const { data, count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .or(`phone_normalized.ilike.%${query}%,name.ilike.%${query}%`)
    .order('name')
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

export async function getCustomersWithStats(
  page = 0,
  pageSize = 20,
): Promise<PaginatedResponse<CustomerWithStats>> {
  const { data, count, error } = await supabase
    .from('customers')
    .select(
      `
      *,
      orders:orders(order_date)
    `,
      { count: 'exact' },
    )
    .order('name')
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) throw error

  const customersWithStats: CustomerWithStats[] = (data || []).map((customer) => {
    const orders = customer.orders as Array<{ order_date: string }> | null
    const orderCount = orders?.length || 0
    const lastOrderDate =
      orders && orders.length > 0
        ? orders.reduce((latest, order) =>
            order.order_date > latest ? order.order_date : latest,
          orders[0].order_date,
        )
        : customer.first_order_date

    return {
      ...customer,
      order_count: orderCount,
      last_order_date: lastOrderDate,
      retention_status: 'active' as const,
    }
  })

  return {
    data: customersWithStats,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export async function getCustomerById(id: string): Promise<CustomerWithStats | null> {
  const { data, error } = await supabase
    .from('customers')
    .select(
      `
      *,
      orders:orders(order_date, channel)
    `,
    )
    .eq('id', id)
    .single()

  if (error) throw error
  if (!data) return null

  const orders = data.orders as Array<{ order_date: string; channel: string }> | null
  const orderCount = orders?.length || 0
  const lastOrderDate =
    orders && orders.length > 0
      ? orders.reduce((latest, order) =>
          order.order_date > latest ? order.order_date : latest,
        orders[0].order_date,
      )
      : data.first_order_date

  return {
    ...data,
    order_count: orderCount,
    last_order_date: lastOrderDate,
    retention_status: 'active' as const,
  }
}

export async function findCustomerByPhone(
  phone: string,
): Promise<Customer | null> {
  const normalized = normalizePhone(phone)
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone_normalized', normalized)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createCustomer(
  customer: Omit<Customer, 'id' | 'created_at'>,
): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      phone_normalized: normalizePhone(customer.phone_normalized),
      name: customer.name,
      first_order_date: customer.first_order_date,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
