'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Clock,
  Scissors,
  Users,
  Link2,
  ExternalLink,
  XCircle,
  Loader2,
  CalendarDays,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { cardStyle } from '../styles';

// ═══════════════════════════════════════════════════════════════
//  My Reserved Fabric — the ORGANIZER side of fabric reservations.
//  Lists the events this customer created from a fabric page's
//  "Reserve for Event", with claim progress, the shareable guest
//  link, and cancellation (unclaimed yards go back to stock).
// ═══════════════════════════════════════════════════════════════

interface ReservationRow {
  id: string;
  reference: string;
  eventName: string;
  fabricId?: string;
  fabricName: string;
  fabricImage?: string;
  pricePerYard: number;
  totalYards: number;
  claimedYards: number;
  reservationFee: number;
  feePaid: boolean;
  deadline: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
}

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  awaiting_fee: { label: 'Awaiting Payment', color: '#B4530A', bg: 'rgba(180,83,10,0.1)' },
  active: { label: 'Active', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  completed: { label: 'Fully Claimed', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  expired: { label: 'Expired', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

function timeLeftLabel(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

export default function ReservedFabric() {
  const { fmt: fmtMoney, currency } = useCurrency();
  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reservations/my', { params: { page: 1, size: 25 } });
      // Envelope walk: the paginated payload ({ data: rows, … }) sits under the
      // response wrapper's own data.
      const payload = res.data?.data ?? res.data;
      const list: any[] = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      const pickUrl = (imgs: any): string | undefined => {
        const first = imgs?.[0];
        return typeof first === 'string' ? first : first?.url;
      };
      setRows(
        list.map((r: any): ReservationRow => {
          const fabricProduct = r.fabric && typeof r.fabric === 'object' ? r.fabric : null;
          const fabricSub = fabricProduct?.fabric;
          return {
            id: r._id,
            reference: r.reference,
            eventName: r.event_name || 'Event',
            fabricId: fabricProduct?._id,
            fabricName: fabricSub?.name || 'Fabric',
            fabricImage: pickUrl(fabricSub?.images),
            pricePerYard: r.price_per_yard ?? fabricSub?.price_per_yard ?? 0,
            totalYards: r.total_yards ?? 0,
            claimedYards: r.claimed_yards ?? 0,
            reservationFee: r.reservation_fee ?? 0,
            feePaid: r.fee_paid !== false,
            deadline: r.deadline,
            status: (r.status as ReservationRow['status']) || 'active',
          };
        }),
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load your reservations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shareUrl = (id: string) =>
    typeof window !== 'undefined' ? `${window.location.origin}/reserve/${id}` : `/reserve/${id}`;

  const handleCopyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl(id));
      toast.success('Guest link copied', {
        description: 'Share it with your event guests so they can claim their yards.',
      });
    } catch {
      toast('Could not copy', { description: shareUrl(id) });
    }
  };

  // Retry an outstanding reservation fee — resolves the "Awaiting Payment"
  // state without cancelling and re-creating the reservation.
  const handlePayFee = async (row: ReservationRow) => {
    setPayingId(row.id);
    try {
      // Charged in the CURRENT display currency — switching the shop to ₦ and
      // retrying is the escape hatch if Stripe misbehaves in your browser.
      const res = await api.post(`/reservations/${row.id}/pay-fee`, {
        currency: currency || 'NGN',
      });
      const d = res.data?.data ?? res.data;
      if (d?.already_paid) {
        toast.success('Fee already paid', { description: 'Your reservation is active.' });
        load();
        return;
      }
      const paymentUrl =
        d?.payment?.paymentUrl ?? d?.payment?.authorization_url;
      if (paymentUrl) {
        try {
          sessionStorage.setItem('pending_reservation_id', row.id);
        } catch {
          /* non-fatal */
        }
        window.location.href = paymentUrl;
        return;
      }
      toast.error('Could not start the payment', { description: 'Please try again.' });
    } catch (err: any) {
      toast.error('Could not start the payment', {
        description: err?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async (row: ReservationRow) => {
    const unclaimed = row.totalYards - row.claimedYards;
    const ok = window.confirm(
      `Cancel the reservation for "${row.eventName}"? ${unclaimed} unclaimed yard${unclaimed === 1 ? '' : 's'} will be released back to the vendor's stock. Guests who already paid keep their fabric.`,
    );
    if (!ok) return;
    setCancellingId(row.id);
    try {
      await api.patch(`/reservations/${row.id}/cancel`);
      toast.success('Reservation cancelled', {
        description: `${unclaimed} yd released back to stock.`,
      });
      load();
    } catch (err: any) {
      toast.error('Could not cancel', {
        description: err?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const activeCount = rows.filter(
    (r) => r.status === 'active' || r.status === 'completed',
  ).length;

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {/* ── Header card ── */}
      <div style={cardStyle}>
        <div className="flex flex-col" style={{ padding: '24px 20px' }}>
          <Scissors size={32} color="var(--text-primary)" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
          <div className="flex items-center" style={{ gap: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Reserved Fabric
            </h3>
            {!loading && !error && rows.length > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-brown)', background: 'rgba(70,40,20,0.08)', padding: '3px 9px', borderRadius: '100px' }}>
                {activeCount} active
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px', marginBottom: 0 }}>
            Events where you&apos;ve locked fabric for your guests. Share each link so guests can claim and pay for their own yards.
          </p>
        </div>
      </div>

      {/* ── States ── */}
      {loading && (
        <div className="flex items-center justify-center" style={{ padding: '48px 0', gap: '10px' }}>
          <Loader2 size={20} color="var(--brand-brown)" className="animate-spin" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading your reservations…</span>
        </div>
      )}

      {!loading && error && (
        <div style={{ ...cardStyle, padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div style={{ ...cardStyle, padding: '52px 28px', textAlign: 'center' }}>
          <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-surface-elevated)', margin: '0 auto 14px' }}>
            <Scissors size={24} color="var(--text-muted)" />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No reservations yet
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '320px', margin: '0 auto 14px' }}>
            Hosting an event? Open any fabric and tap &ldquo;Reserve for Event&rdquo; to lock yards for your guests.
          </p>
          <Link
            href="/products"
            style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-brown)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Browse fabrics
          </Link>
        </div>
      )}

      {/* ── Reservation cards ── */}
      {!loading && !error && rows.map((row) => {
        const isLive = row.status === 'active';
        const meta =
          isLive && !row.feePaid
            ? STATUS_META.awaiting_fee
            : STATUS_META[row.status] ?? STATUS_META.active;
        const pct = row.totalYards > 0 ? Math.min(100, (row.claimedYards / row.totalYards) * 100) : 0;
        const dim = row.status === 'expired' || row.status === 'cancelled';
        return (
          <div key={row.id} style={{ ...cardStyle, opacity: dim ? 0.72 : 1 }}>
            {/* Top: fabric + identity */}
            <div className="flex" style={{ padding: '16px 20px', gap: '14px' }}>
              <Link
                href={row.fabricId ? `/products/${row.fabricId}` : '#'}
                className="relative flex-shrink-0 overflow-hidden"
                style={{ width: '64px', height: '80px', borderRadius: '12px', background: 'var(--bg-surface-elevated)' }}
              >
                {row.fabricImage ? (
                  <Image src={row.fabricImage} alt={row.fabricName} fill style={{ objectFit: 'cover' }} sizes="64px" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full">
                    <Scissors size={20} color="var(--text-muted)" />
                  </span>
                )}
              </Link>

              <div className="flex flex-col flex-1 min-w-0" style={{ gap: '5px' }}>
                <div className="flex items-start justify-between" style={{ gap: '8px' }}>
                  <span className="truncate" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {row.eventName}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: meta.color, background: meta.bg, padding: '3px 9px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {meta.label}
                  </span>
                </div>
                <span className="truncate" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {row.fabricName} · {fmtMoney(row.pricePerYard)}/yd
                </span>

                {/* Progress */}
                <div style={{ marginTop: '4px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {row.claimedYards}/{row.totalYards} yd claimed
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: pct >= 100 ? '#059669' : '#D4AF37' }}>
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <div className="w-full rounded-full" style={{ height: '6px', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: pct >= 100 ? '#059669' : '#D4AF37' }}
                    />
                  </div>
                </div>

                {/* Deadline + fee */}
                <div className="flex items-center flex-wrap" style={{ gap: '10px', marginTop: '4px' }}>
                  <span className="flex items-center" style={{ gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {isLive ? <Clock size={11} /> : <CalendarDays size={11} />}
                    {isLive
                      ? timeLeftLabel(row.deadline)
                      : new Date(row.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center" style={{ gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <Users size={11} />
                    Fee {fmtMoney(row.reservationFee)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center" style={{ padding: '12px 20px', borderTop: '1px solid var(--border-glass)', gap: '8px' }}>
              {isLive && !row.feePaid && (
                <button
                  onClick={() => handlePayFee(row)}
                  disabled={payingId === row.id}
                  className="flex-1 flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ gap: '6px', padding: '10px', borderRadius: '10px', background: '#064E3B', color: '#FFFFFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', border: 'none', cursor: payingId === row.id ? 'wait' : 'pointer' }}
                >
                  {payingId === row.id
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Clock size={13} />}
                  Pay Fee
                </button>
              )}
              <button
                onClick={() => handleCopyLink(row.id)}
                className="flex-1 flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ gap: '6px', padding: '10px', borderRadius: '10px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', border: 'none', cursor: 'pointer' }}
              >
                <Link2 size={13} />
                Copy Guest Link
              </button>
              <Link
                href={`/reserve/${row.id}`}
                className="flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-[0.98]"
                style={{ gap: '6px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'none', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', textDecoration: 'none' }}
              >
                <ExternalLink size={13} />
                View
              </Link>
              {isLive && (
                <button
                  onClick={() => handleCancel(row)}
                  disabled={cancellingId === row.id}
                  className="flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ gap: '6px', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: cancellingId === row.id ? 'wait' : 'pointer' }}
                >
                  {cancellingId === row.id
                    ? <Loader2 size={13} className="animate-spin" />
                    : <XCircle size={13} />}
                  Cancel
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
