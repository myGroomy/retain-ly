'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  UsersThree,
  ArrowsClockwise,
  PersonSimpleWalk,
  ChartPie,
  ShoppingBag,
  Storefront,
  WhatsappLogo,
  UserPlus,
  ArrowSquareOut,
  TrendUp,
  Trophy,
  DownloadSimple,
  FunnelSimple,
  Prohibit,
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCustomersWithStats } from '@/services/customerService'
import { getRetentionStatus, getRetentionLabel } from '@/utils/churnStatus'
import { buildWaLink } from '@/utils/waLinkBuilder'
import { downloadVCard } from '@/utils/vcardGenerator'
import { CHANNELS, DEFAULT_THRESHOLDS } from '@/constants'
import { fadeUp } from '@/lib/motion'
import { useMounted } from '@/lib/useMounted'
import type { CustomerWithStats, RetentionStatus, BranchType } from '@/types'

const BRANCHES: { id: BranchType | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Semua Cabang' },
  { id: 'CMH', label: 'Cimahi (CMH)' },
  { id: 'BDG', label: 'Bandung (BDG)' },
]

const AGE_RANGES = ['<17', '17-25', '26-35', '36-45', '46-55', '56+']
const GENDERS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
]

export default function DashboardPage() {
  const ready = useMounted()
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<RetentionStatus | 'all'>('all')
  const [branchFilter, setBranchFilter] = useState<BranchType | 'ALL'>('ALL')
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL')
  const [ageFilter, setAgeFilter] = useState<string>('ALL')
  const [channelFilter, setChannelFilter] = useState<string>('ALL')

  const [userRole, setUserRole] = useState('')
  const [userBranch, setUserBranch] = useState('')
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('retainly_user') || '{}')
      setUserRole(user.role || '')
      setUserBranch(user.branch || '')
      if (user.role === 'kasir' && user.branch) {
        setBranchFilter(user.branch as BranchType)
      }
    } catch {}
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const r = await getCustomersWithStats(0, 10000)
        setCustomers(r.data.map((c) => ({ ...c, retention_status: getRetentionStatus(c.last_order_date, DEFAULT_THRESHOLDS) })))
      } catch { /* silent */ } finally { setLoading(false) }
    })()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-accent" />
      </div>
    )
  }

  const branchCustomers = branchFilter === 'ALL'
    ? customers
    : customers.filter(c => {
        const hasOrdersInBranch = c.orders?.some(o => o.branch === branchFilter)
        return hasOrdersInBranch || c.branch === branchFilter
      })

  const filteredCustomers = branchCustomers.filter(c => {
    if (genderFilter !== 'ALL' && c.gender !== genderFilter) return false
    if (ageFilter !== 'ALL' && c.age_range !== ageFilter) return false
    if (channelFilter !== 'ALL' && !c.orders?.some(o => o.channel === channelFilter)) return false
    return true
  })

  const counts = { active: 0, at_risk: 0, churned: 0 }
  const channelCounts: Record<string, number> = {}
  const branchCounts: Record<string, number> = {}
  const ageRangeCounts: Record<string, number> = {}
  const genderCounts: Record<string, number> = {}
  let totalOrdersAll = 0

  filteredCustomers.forEach((c) => {
    counts[c.retention_status as keyof typeof counts]++
    totalOrdersAll += c.order_count || 0

    // Age range breakdown
    if (c.age_range) {
      ageRangeCounts[c.age_range] = (ageRangeCounts[c.age_range] || 0) + 1
    }
    // Gender breakdown
    if (c.gender) {
      genderCounts[c.gender] = (genderCounts[c.gender] || 0) + 1
    }

    if (c.orders && Array.isArray(c.orders)) {
      c.orders.forEach((o) => {
        channelCounts[o.channel] = (channelCounts[o.channel] || 0) + 1
        if (o.branch) {
          branchCounts[o.branch] = (branchCounts[o.branch] || 0) + 1
        }
      })
    }
  })

  const channelTotal = Object.values(channelCounts).reduce((a, b) => a + b, 0)

  const total = filteredCustomers.length
  const repeatCount = branchCustomers.filter((c) => (c.order_count || 0) > 1).length
  const repeatRate = total > 0 ? Math.round((repeatCount / total) * 100) : 0
  const churnRate = total > 0 ? Math.round((counts.churned / total) * 100) : 0
  const avgOrder = total > 0 ? (totalOrdersAll / total).toFixed(1) : '0'

  const topChannelEntry = Object.entries(channelCounts).sort((a, b) => b[1] - a[1])[0]
  const topChannelLabel = topChannelEntry ? (CHANNELS.find((ch) => ch.id === topChannelEntry[0])?.label || topChannelEntry[0]) : 'N/A'

  const categoryCustomers = activeTab === 'all'
    ? filteredCustomers
    : filteredCustomers.filter((c) => c.retention_status === activeTab)

  const topRepeat = [...filteredCustomers]
    .sort((a, b) => (b.order_count || 0) - (a.order_count || 0))
    .slice(0, 20)

  const channelList = CHANNELS.map((ch) => ({
    ...ch,
    count: channelCounts[ch.id] || 0,
  })).filter((ch) => ch.count > 0).sort((a, b) => b.count - a.count)

  const getChannelLabel = (id: string) => CHANNELS.find((ch) => ch.id === id)?.label || id

  const statsGrid = [
    {
      label: 'Total Customer',
      value: total,
      unit: 'orang',
      sub: `${counts.active} aktif · ${counts.at_risk} risk`,
      icon: UsersThree,
      hue: 'text-accent',
      glow: 'bg-accent/10',
    },
    {
      label: 'Repeat Rate',
      value: repeatRate,
      unit: '%',
      sub: `${repeatCount} customer repeat`,
      icon: ArrowsClockwise,
      hue: 'text-emerald',
      glow: 'bg-emerald/10',
    },
    {
      label: 'Churn Rate',
      value: churnRate,
      unit: '%',
      sub: `${counts.churned} customer churned`,
      icon: PersonSimpleWalk,
      hue: 'text-ink',
      glow: 'bg-rose/10',
    },
    {
      label: 'Rata-Rata Order',
      value: avgOrder,
      unit: 'x',
      sub: `Channel #1: ${topChannelLabel}`,
      icon: ShoppingBag,
      hue: 'text-accent-deep',
      glow: 'bg-amber/10',
    },
  ]

  const segments = [
    { key: 'active' as const, label: 'Aktif', range: '0–30 hari', count: counts.active, color: 'bg-emerald', pct: total > 0 ? Math.round((counts.active / total) * 100) : 0 },
    { key: 'at_risk' as const, label: 'At Risk', range: '31–60 hari', count: counts.at_risk, color: 'bg-amber', pct: total > 0 ? Math.round((counts.at_risk / total) * 100) : 0 },
    { key: 'churned' as const, label: 'Churned', range: '61+ hari', count: counts.churned, color: 'bg-rose', pct: total > 0 ? Math.round((counts.churned / total) * 100) : 0 },
  ]

  const getStatusBadge = (status: RetentionStatus) => {
    if (status === 'active') return <Badge className="bg-emerald/10 text-emerald border-emerald/20">Active</Badge>
    if (status === 'at_risk') return <Badge className="bg-amber/10 text-accent-deep border-amber/20">At Risk</Badge>
    return <Badge className="bg-rose/10 text-ink border-rose/20">Churned</Badge>
  }

  const getAvatarStyle = (status: RetentionStatus) => {
    if (status === 'active') return 'bg-accent-wash text-accent-deep'
    if (status === 'at_risk') return 'bg-amber/10 text-accent-deep'
    return 'bg-rose/10 text-ink'
  }

  const getDaysSince = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 86400000)

  const downloadCsv = (rows: Record<string, string | number>[], filename: string) => {
    if (rows.length === 0) return
    const headers = Object.keys(rows[0])
    const BOM = '\uFEFF'
    const csvContent = [
      headers.map((h) => `"${h.replace(/_/g, ' ').toUpperCase()}"`).join(','),
      ...rows.map((row) => headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownload = () => {
    const rows = categoryCustomers.map((c, idx) => ({
      no: idx + 1,
      nama_customer: c.name,
      no_whatsapp: c.phone_normalized,
      gender: c.gender === 'L' ? 'Laki-laki' : c.gender === 'P' ? 'Perempuan' : '',
      usia: c.age_range || '',
      cabang: c.branch || [...new Set(c.orders?.map(o => o.branch).filter(Boolean) || [])].join('+'),
      jumlah_order: c.order_count || 0,
      order_terakhir: c.last_order_date,
      lama_tidak_order_hari: getDaysSince(c.last_order_date),
      status_retensi: getRetentionLabel(c.retention_status),
    }))
    const tag = [
      branchFilter === 'ALL' ? 'SemuaCabang' : branchFilter,
      genderFilter === 'ALL' ? 'SemuaGender' : genderFilter,
      ageFilter === 'ALL' ? 'SemuaUsia' : ageFilter,
      channelFilter === 'ALL' ? 'SemuaChannel' : getChannelLabel(channelFilter).replace(/\s+/g, ''),
      activeTab === 'all' ? 'SemuaStatus' : activeTab,
    ].join('-')
    downloadCsv(rows, `Dashboard_Retensi_${tag}.csv`)
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-10 pb-28 md:pb-20">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge className="h-auto rounded-full border-hairline bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Laporan Retensi & Analitik</Badge>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-4xl">Dashboard Retensi</h1>
            <p className="mt-1.5 text-xs text-ash sm:text-sm">Analisis detail kesehatan basis pelanggan dan performa transaksi F&B</p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={categoryCustomers.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-ink ring-1 ring-ink/10 transition-all hover:bg-ink/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
          >
            <DownloadSimple size={18} weight="duotone" className="text-accent" />
            Download Laporan
          </button>
        </div>
      </motion.div>

      {/* Branch Filter */}
      <motion.div variants={fadeUp} custom={1} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {BRANCHES.map((b) => {
            const isDisabled = (userRole === 'kasir' && b.id === 'ALL') ||
                               (userRole === 'kasir' && b.id !== userBranch)
            return (
              <button
                key={b.id}
                onClick={() => {
                  if (!isDisabled) {
                    setBranchFilter(b.id)
                  }
                }}
                disabled={isDisabled}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  branchFilter === b.id
                    ? 'bg-white text-ink ring-1 ring-ink/10 shadow-[0_6px_16px_-6px_rgba(27,44,193,0.5)]'
                    : isDisabled
                      ? 'border border-hairline bg-sunken text-ash cursor-not-allowed opacity-60'
                      : 'border border-hairline bg-white text-ash hover:bg-sunken hover:text-ink'
                }`}
              >
                <Storefront size={14} weight="duotone" />
                {b.label}
              </button>
            )
          })}
        </div>
        {userRole === 'kasir' && (
          <p className="mt-2 text-xs text-ash">Kasir hanya bisa melihat data cabang sendiri ({userBranch})</p>
        )}
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={fadeUp} custom={2} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mb-6">
        <div className="doppel-outer">
          <div className="doppel-inner p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <FunnelSimple size={16} weight="duotone" className="text-accent" />
                <span className="text-xs font-semibold uppercase tracking-wider text-ash">Filter Laporan</span>
              </div>
              {(genderFilter !== 'ALL' || ageFilter !== 'ALL' || channelFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => { setGenderFilter('ALL'); setAgeFilter('ALL'); setChannelFilter('ALL') }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink rounded-full px-3 py-1.5 ring-1 ring-ink/10 bg-white transition-all hover:bg-ink/5 active:scale-95"
                >
                  <Prohibit size={13} weight="duotone" className="text-accent" />
                  Reset Filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-ash">Gender</span>
                <Select value={genderFilter} onValueChange={(v) => v && setGenderFilter(v as 'ALL' | 'L' | 'P')}>
                  <SelectTrigger className="h-10 w-full rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Gender</SelectItem>
                    {GENDERS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-ash">Rentang Usia</span>
                <Select value={ageFilter} onValueChange={(v) => v && setAgeFilter(v)}>
                  <SelectTrigger className="h-10 w-full rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Usia</SelectItem>
                    {AGE_RANGES.map((ar) => <SelectItem key={ar} value={ar}>Usia {ar} th</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-ash">Channel Order</span>
                <Select value={channelFilter} onValueChange={(v) => v && setChannelFilter(v)}>
                  <SelectTrigger className="h-10 w-full rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Channel</SelectItem>
                    {CHANNELS.map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 mb-6">
        {statsGrid.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            custom={i + 2}
            initial="hidden"
            animate={ready ? 'show' : 'hidden'}
          >
            <div className="doppel-outer h-full">
              <div className="doppel-inner flex h-full flex-col justify-between p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ash">{s.label}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${s.glow}`}>
                    <s.icon size={18} weight="duotone" className={s.hue} />
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    {s.value}
                    {s.unit && <span className="text-lg font-normal text-mist ml-1">{s.unit}</span>}
                  </div>
                  <div className="mt-1 text-xs text-ash">{s.sub}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Segmentation & Channel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 mb-8">
        <motion.div variants={fadeUp} custom={6} initial="hidden" animate={ready ? 'show' : 'hidden'} className="lg:col-span-7">
          <div className="doppel-outer h-full">
            <div className="doppel-inner p-5 sm:p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-ink">Segmentasi Status Retensi</h2>
                  <span className="text-xs text-ash font-mono">{total} total</span>
                </div>
                <div className="space-y-4">
                  {segments.map((s) => (
                    <div key={s.key}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                          <span className="font-semibold text-ink">{s.label}</span>
                          <span className="text-mist">({s.range})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink">{s.count} orang</span>
                          <span className="text-ash">({s.pct}%)</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-sunken">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${s.color}`}
                          style={{ width: `${s.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-sunken/60 p-3 text-xs text-ash">
                <div className="flex items-center gap-1.5">
                  <TrendUp size={16} className="text-accent" />
                  <span>Strategi Retensi:</span>
                </div>
                <span className="font-medium text-ink">Segera hubungi customer At Risk & Churned</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} custom={7} initial="hidden" animate={ready ? 'show' : 'hidden'} className="lg:col-span-5">
          <div className="doppel-outer h-full">
            <div className="doppel-inner p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-ink">Distribusi Channel Order</h2>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ash">{channelTotal} order</span>
                  <ChartPie size={18} weight="duotone" className="text-accent" />
                </div>
              </div>

              <div className="space-y-3">
                {channelList.length > 0 ? channelList.map((ch) => {
                  const pct = channelTotal > 0 ? Math.round((ch.count / channelTotal) * 100) : 0
                  return (
                    <div key={ch.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        <span className="font-medium text-ink">{ch.label}</span>
                      </div>
                      <div className="flex flex-1 items-center gap-2 mx-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="font-mono text-ash shrink-0">
                        {ch.count} <span className="text-[10px] text-mist">({pct}%)</span>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="py-8 text-center text-xs text-ash">
                    Tidak ada data channel pada filter ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Rank Repeat Order */}
      <motion.div variants={fadeUp} custom={7.6} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mb-8">
        <div className="doppel-outer">
          <div className="doppel-inner p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber/10">
                  <Trophy size={18} weight="duotone" className="text-accent-deep" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Top Rank Repeat Order</h2>
                  <p className="text-[11px] text-ash">20 customer dengan transaksi berulang tertinggi</p>
                </div>
              </div>
              <span className="text-xs font-mono text-ash">Top 1–20</span>
            </div>

            {topRepeat.length > 0 ? (
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {topRepeat.map((c, i) => {
                  const rank = i + 1
                  const rankStyle =
                    rank === 1
                      ? 'bg-amber/10 text-accent-deep ring-1 ring-ink/15 font-extrabold border-accent/30'
                      : rank === 2
                        ? 'bg-ink/5 text-ink ring-1 ring-ink/10 font-bold'
                        : rank === 3
                          ? 'bg-accent-wash/60 text-accent ring-1 ring-accent/20 font-bold'
                          : 'bg-sunken text-ash'
                  const days = getDaysSince(c.last_order_date)
                  const customerBranches = [...new Set(c.orders?.map(o => o.branch).filter(Boolean) || [])]
                  return (
                    <li key={c.id} className="group flex items-center gap-3 rounded-2xl border border-hairline bg-white p-3 transition-all duration-300 hover:border-accent/30 hover:bg-accent-wash/30">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs ${rankStyle}`}>
                        {rank}
                      </span>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold ${getAvatarStyle(c.retention_status)}`}>
                        {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-ink truncate">{c.name}</span>
                          {customerBranches.length > 0 && (
                            <span className="text-[10px] bg-sunken rounded-full px-2 py-0.5 text-ash">{customerBranches.join(', ')}</span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ash">
                          <span>Order ke-{(c.order_count || 0) + 1}</span>
                          <span>&middot;</span>
                          <span>{c.last_order_date}</span>
                          <span>&middot;</span>
                          <span className={days > DEFAULT_THRESHOLDS.atRiskDays ? 'text-ink' : 'text-mist'}>
                            {days === 0 ? 'order hari ini' : `${days} hari lalu`}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-lg font-semibold text-ink">{c.order_count}x</div>
                        <div className="text-[10px] text-mist">repeat</div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <div className="py-10 text-center text-sm text-ash">Tidak ada data pada filter ini.</div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Age & Gender Breakdown */}
      <motion.div variants={fadeUp} custom={7.5} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Age Range Breakdown */}
          <div className="doppel-outer">
            <div className="doppel-inner p-5">
              <h2 className="text-base font-semibold text-ink mb-4">Breakdown Usia</h2>
              <div className="space-y-2.5">
                {AGE_RANGES.map((ar) => {
                  const count = ageRangeCounts[ar] || 0
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={ar} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink w-16">{ar}</span>
                      <div className="flex flex-1 items-center gap-2 mx-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                          <div className="h-full rounded-full bg-accent-soft" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="font-mono text-ash shrink-0">{count} <span className="text-[10px] text-mist">({pct}%)</span></span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Gender Breakdown */}
          <div className="doppel-outer">
            <div className="doppel-inner p-5">
              <h2 className="text-base font-semibold text-ink mb-4">Breakdown Gender</h2>
              <div className="space-y-2.5">
                {GENDERS.map((g) => {
                  const count = genderCounts[g.value] || 0
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={g.value} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink w-24">{g.label}</span>
                      <div className="flex flex-1 items-center gap-2 mx-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                          <div className="h-full rounded-full bg-emerald" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="font-mono text-ash shrink-0">{count} <span className="text-[10px] text-mist">({pct}%)</span></span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Branch Breakdown (owner only) */}
      {userRole === 'owner' && Object.keys(branchCounts).length > 0 && (
        <motion.div variants={fadeUp} custom={8} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mb-8">
          <div className="doppel-outer">
            <div className="doppel-inner p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-ink">Order per Cabang</h2>
                <Storefront size={18} weight="duotone" className="text-accent" />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Object.entries(branchCounts).sort((a, b) => b[1] - a[1]).map(([branch, count]) => {
                  const pct = totalOrdersAll > 0 ? Math.round((count / totalOrdersAll) * 100) : 0
                  return (
                    <div key={branch} className="rounded-2xl border border-hairline bg-white p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Storefront size={14} weight="duotone" className="text-accent" />
                        <span className="text-sm font-semibold text-ink">{branch}</span>
                      </div>
                      <div className="text-2xl font-bold text-ink">{count}</div>
                      <div className="text-xs text-ash">{pct}% dari total order</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category List */}
      <motion.div variants={fadeUp} custom={9} initial="hidden" animate={ready ? 'show' : 'hidden'} className="mt-8">
        <div className="doppel-outer">
          <div className="doppel-inner p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-ink">Laporan Pelanggan per Kategori</h2>
                <p className="text-xs text-ash">Daftar lengkap pelanggan berdasarkan kategori churn & retensi</p>
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar bg-sunken/60 p-1 rounded-full border border-hairline">
                {([
                  { key: 'all' as const, label: 'Semua', count: total },
                  { key: 'active' as const, label: 'Aktif', count: counts.active },
                  { key: 'at_risk' as const, label: 'At Risk', count: counts.at_risk },
                  { key: 'churned' as const, label: 'Churned', count: counts.churned },
                ]).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeTab === t.key
                        ? 'bg-white text-ink shadow-sm'
                        : 'text-ash hover:text-ink'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="rounded-full bg-sunken px-1.5 py-0.5 text-[10px] text-ash font-bold">{t.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {categoryCustomers.length > 0 ? (
                categoryCustomers.map((c) => {
                  const days = getDaysSince(c.last_order_date)
                  const customerBranches = [...new Set(c.orders?.map(o => o.branch).filter(Boolean) || [])]

                  return (
                    <div
                      key={c.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-hairline bg-white p-3.5 sm:p-4 transition-all duration-300 hover:border-accent/30 hover:bg-accent-wash/30"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold ${getAvatarStyle(c.retention_status)}`}>
                          {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-ink truncate">{c.name}</span>
                            {getStatusBadge(c.retention_status)}
                            <Badge variant="outline" className="border-accent/20 text-accent">
                              Order ke-{(c.order_count || 0) + 1}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ash">
                            <span className="font-mono text-ink-soft">{c.phone_normalized}</span>
                            <span>&middot;</span>
                            <span className="font-semibold text-accent">{c.order_count}x order</span>
                            {customerBranches.length > 0 && (
                              <>
                                <span>&middot;</span>
                                <span className="text-[10px] bg-sunken rounded-full px-2 py-0.5">
                                  {customerBranches.join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-hairline pt-2.5 sm:pt-0 shrink-0">
                        <div className="text-left sm:text-right text-xs text-ash">
                          <div className="font-medium text-ink">Order: {c.last_order_date}</div>
                          <div className="text-[10px] text-mist">{days === 0 ? 'Hari ini' : `${days} hari lalu`}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={buildWaLink(c.phone_normalized, c.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink ring-1 ring-ink/10 transition-all hover:scale-105 active:scale-95"
                            title="WhatsApp"
                          >
                            <WhatsappLogo size={16} weight="fill" />
                          </a>
                          <button
                            onClick={() => downloadVCard(c.name, c.phone_normalized)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white text-ash transition-all hover:bg-sunken hover:text-ink active:scale-95"
                            title="Download vCard"
                          >
                            <UserPlus size={15} weight="duotone" />
                          </button>
                          <Link
                            href={`/app/customers/${c.id}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white text-accent transition-all hover:bg-accent-wash active:scale-95"
                            title="Detail Profil"
                          >
                            <ArrowSquareOut size={16} weight="bold" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-12 text-center text-ash text-sm">
                  Tidak ada customer di kategori ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
