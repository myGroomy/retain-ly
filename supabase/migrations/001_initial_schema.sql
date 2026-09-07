-- Retain-ly Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_normalized TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  first_order_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for phone search (autocomplete)
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone_normalized);
-- Index for name search
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (name);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  order_date DATE NOT NULL,
  channel TEXT NOT NULL,
  raw_phone_input TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders (order_date);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders (channel);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (single-branch app)
CREATE POLICY "Allow all for anon" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON orders FOR ALL USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get customer with stats
CREATE OR REPLACE FUNCTION get_customer_with_stats(customer_uuid UUID)
RETURNS TABLE (
  id UUID,
  phone_normalized TEXT,
  name TEXT,
  first_order_date DATE,
  created_at TIMESTAMPTZ,
  order_count BIGINT,
  last_order_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.phone_normalized,
    c.name,
    c.first_order_date,
    c.created_at,
    COUNT(o.id) as order_count,
    COALESCE(MAX(o.order_date), c.first_order_date) as last_order_date
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id
  WHERE c.id = customer_uuid
  GROUP BY c.id, c.phone_normalized, c.name, c.first_order_date, c.created_at;
END;
$$ LANGUAGE plpgsql;

-- Function to get all customers with stats (paginated)
CREATE OR REPLACE FUNCTION get_customers_with_stats(
  p_offset INT DEFAULT 0,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  phone_normalized TEXT,
  name TEXT,
  first_order_date DATE,
  created_at TIMESTAMPTZ,
  order_count BIGINT,
  last_order_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.phone_normalized,
    c.name,
    c.first_order_date,
    c.created_at,
    COUNT(o.id) as order_count,
    COALESCE(MAX(o.order_date), c.first_order_date) as last_order_date
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id, c.phone_normalized, c.name, c.first_order_date, c.created_at
  ORDER BY c.name
  OFFSET p_offset
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (optional - for testing)
-- ============================================
INSERT INTO customers (phone_normalized, name, first_order_date) VALUES
  ('081234567890', 'Budi Santoso', '2024-01-15'),
  ('081987654321', 'Siti Rahmawati', '2024-02-20'),
  ('085711223344', 'Dimas Anggara', '2024-01-05'),
  ('082199887766', 'Maya Putri', '2024-03-10'),
  ('081344556677', 'Hendra Wijaya', '2024-02-01')
ON CONFLICT (phone_normalized) DO NOTHING;

-- Seed orders
DO $$
DECLARE
  customer RECORD;
  channels TEXT[] := ARRAY['dine_in', 'takeaway', 'gofood', 'grab', 'shopee', 'whatsapp'];
  i INT;
BEGIN
  FOR customer IN SELECT id, first_order_date FROM customers ORDER BY created_at
  LOOP
    FOR i IN 1..FLOOR(RANDOM() * 8 + 1)::INT
    LOOP
      INSERT INTO orders (customer_id, order_date, channel, raw_phone_input)
      VALUES (
        customer.id,
        customer.first_order_date + (FLOOR(RANDOM() * 180))::INT,
        channels[FLOOR(RANDOM() * 6 + 1)::INT],
        '081234567890'
      );
    END LOOP;
  END LOOP;
END $$;
