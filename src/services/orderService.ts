import { getSheetData, appendRow } from './sheetsService'
import { generateId } from '@/utils/generateId'
import type { Order, OrderWithCustomer, PaginatedResponse } from '@/types'

const ORDERS_SHEET = 'orders'
const CUSTOMERS_SHEET = 'customers'

function toOrder(row: Record<string, string>): Order {
  return {
    id: row.id,
    customer_id: row.customer_id,
    order_date: row.order_date,
    channel: row.channel as Order['channel'],
    raw_phone_input: row.raw_phone_input || null,
    created_at: row.created_at,
    branch: row.branch || '',
  }
}

function paginate<T>(data: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = page * pageSize
  const end = start + pageSize
  return {
    data: data.slice(start, end),
    count: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize),
  }
}

export async function createOrder(
  order: Omit<Order, 'id' | 'created_at'>,
): Promise<Order> {
  const customers = await getSheetData(CUSTOMERS_SHEET)
  const customerExists = customers.some(c => c.id === order.customer_id)

  if (!customerExists) {
    throw new Error('Customer not found')
  }

  const newOrder: Order = {
    id: generateId(),
    customer_id: order.customer_id,
    order_date: order.order_date,
    channel: order.channel,
    raw_phone_input: order.raw_phone_input,
    created_at: new Date().toISOString(),
    branch: order.branch || '',
  }

  await appendRow(ORDERS_SHEET, {
    id: newOrder.id,
    customer_id: newOrder.customer_id,
    order_date: newOrder.order_date,
    channel: newOrder.channel,
    raw_phone_input: newOrder.raw_phone_input || '',
    created_at: newOrder.created_at,
    branch: newOrder.branch || '',
  })

  return newOrder
}

export async function getOrdersByCustomer(
  customerId: string,
  page = 0,
  pageSize = 20,
): Promise<PaginatedResponse<Order>> {
  const orders = await getSheetData(ORDERS_SHEET)
  const customerOrders = orders
    .filter(o => o.customer_id === customerId)
    .map(toOrder)
    .sort((a, b) => b.order_date.localeCompare(a.order_date))

  return paginate(customerOrders, page, pageSize)
}

export async function getOrdersByDate(date: string): Promise<OrderWithCustomer[]> {
  const orders = await getSheetData(ORDERS_SHEET)
  const customers = await getSheetData(CUSTOMERS_SHEET)

  const customersMap = new Map(customers.map(c => [c.id, c]))

  return orders
    .filter(o => o.order_date === date)
    .map(toOrder)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(order => ({
      ...order,
      customer: customersMap.get(order.customer_id)
        ? {
            id: customersMap.get(order.customer_id)!.id,
            phone_normalized: customersMap.get(order.customer_id)!.phone_normalized,
            name: customersMap.get(order.customer_id)!.name,
            first_order_date: customersMap.get(order.customer_id)!.first_order_date,
            created_at: customersMap.get(order.customer_id)!.created_at,
            branch: customersMap.get(order.customer_id)!.branch,
          }
        : undefined,
    }))
}
