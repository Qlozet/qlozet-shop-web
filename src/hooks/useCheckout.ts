'use client';

import { useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import type {
  CheckoutPreviewResponse,
  VendorShippingRate,
  FabricTransferRate,
  CourierRate,
  CreateOrderPayload,
  SelectedShipping,
  SelectedFabricTransfer,
  OrderResponse,
} from '@/lib/api-types';

// ═══════════════════════════════════════════════════════════════
//  useCheckout
//  Manages checkout-preview, courier selection, and order placement.
// ═══════════════════════════════════════════════════════════════

interface SelectedCourier {
  business_id: string;
  request_token: string;
  courier: CourierRate;
}

interface SelectedFabricCourier {
  key: string; // fabric_vendor_id + tailor_vendor_id
  transfer: FabricTransferRate;
  courier: CourierRate;
}

export function useCheckout() {
  const { cart, clearCart } = useApp();

  // ── State ──────────────────────────────────────────────────
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);

  // Courier selections (one per vendor, one per fabric transfer)
  const [selectedCouriers, setSelectedCouriers] = useState<SelectedCourier[]>([]);
  const [selectedFabricCouriers, setSelectedFabricCouriers] = useState<SelectedFabricCourier[]>([]);

  // ── Fetch checkout preview ─────────────────────────────────
  const fetchPreview = useCallback(async (addressId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/orders/checkout-preview', {
        service_type: 'pickup',
        ...(addressId ? { address_id: addressId } : {}),
      });
      const data: CheckoutPreviewResponse = res.data?.data ?? res.data;
      setPreview(data);

      // Auto-select cheapest courier for each vendor
      const autoSelected: SelectedCourier[] = data.vendor_shipping.map((vs) => {
        const cheapest = vs.rates.reduce((a, b) =>
          a.rate_amount <= b.rate_amount ? a : b
        );
        return {
          business_id: vs.business_id,
          request_token: vs.request_token,
          courier: cheapest,
        };
      });
      setSelectedCouriers(autoSelected);

      // Auto-select cheapest courier for fabric transfers
      const autoFabric: SelectedFabricCourier[] = data.fabric_transfers.map((ft) => {
        const cheapest = ft.rates.reduce((a, b) =>
          a.rate_amount <= b.rate_amount ? a : b
        );
        return {
          key: `${ft.fabric_vendor_id}_${ft.tailor_vendor_id}`,
          transfer: ft,
          courier: cheapest,
        };
      });
      setSelectedFabricCouriers(autoFabric);

      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load shipping rates';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Select a courier for a vendor ──────────────────────────
  const selectCourier = useCallback((businessId: string, courier: CourierRate) => {
    setSelectedCouriers((prev) => {
      const vendor = preview?.vendor_shipping.find((v) => v.business_id === businessId);
      if (!vendor) return prev;
      const existing = prev.filter((s) => s.business_id !== businessId);
      return [
        ...existing,
        { business_id: businessId, request_token: vendor.request_token, courier },
      ];
    });
  }, [preview]);

  // ── Select a courier for a fabric transfer ─────────────────
  const selectFabricCourier = useCallback((key: string, courier: CourierRate) => {
    setSelectedFabricCouriers((prev) => {
      const transfer = preview?.fabric_transfers.find(
        (ft) => `${ft.fabric_vendor_id}_${ft.tailor_vendor_id}` === key
      );
      if (!transfer) return prev;
      const existing = prev.filter((s) => s.key !== key);
      return [...existing, { key, transfer, courier }];
    });
  }, [preview]);

  // ── Computed totals ────────────────────────────────────────
  const totalShipping = useMemo(() => {
    const vendorShipping = selectedCouriers.reduce((sum, s) => sum + s.courier.rate_amount, 0);
    const fabricShipping = selectedFabricCouriers.reduce((sum, s) => sum + s.courier.rate_amount, 0);
    return vendorShipping + fabricShipping;
  }, [selectedCouriers, selectedFabricCouriers]);

  const total = useMemo(() => {
    return (preview?.subtotal ?? 0) + totalShipping;
  }, [preview, totalShipping]);

  const isReady = useMemo(() => {
    if (!preview) return false;
    // Every vendor must have a courier selected
    const allVendorsSelected = preview.vendor_shipping.every((vs) =>
      selectedCouriers.some((s) => s.business_id === vs.business_id)
    );
    // Every fabric transfer must have a courier selected
    const allFabricSelected = preview.fabric_transfers.every((ft) =>
      selectedFabricCouriers.some(
        (s) => s.key === `${ft.fabric_vendor_id}_${ft.tailor_vendor_id}`
      )
    );
    return allVendorsSelected && allFabricSelected;
  }, [preview, selectedCouriers, selectedFabricCouriers]);

  // ── Place order ────────────────────────────────────────────
  const placeOrder = useCallback(async (
    paymentMethod: 'paystack' | 'wallet' = 'paystack',
    addressId?: string,
  ) => {
    if (!preview || !isReady) {
      setError('Please select shipping for all vendors before placing your order.');
      return null;
    }

    setPlacing(true);
    setError(null);

    try {
      // Build items from cart
      const items = cart.map((item) => ({
        product_id: item.id,
        note: item.note,
        quantity: item.quantity,
        selections: item.selections || {},
      }));

      // Build shipping selections
      const selected_shipping: SelectedShipping[] = selectedCouriers.map((s) => ({
        business_id: s.business_id,
        request_token: s.request_token,
        courier_id: String(s.courier.courier_id),
        service_code: s.courier.service_code,
        courier_name: s.courier.courier_name,
        shipping_fee: s.courier.rate_amount,
      }));

      // Build fabric transfer selections
      const selected_fabric_transfers: SelectedFabricTransfer[] = selectedFabricCouriers.map((s) => ({
        fabric_vendor_id: s.transfer.fabric_vendor_id,
        tailor_vendor_id: s.transfer.tailor_vendor_id,
        fabric_product_id: s.transfer.fabric_product_id,
        fabric_yards: s.transfer.fabric_yards,
        request_token: s.transfer.request_token,
        courier_id: String(s.courier.courier_id),
        service_code: s.courier.service_code,
        courier_name: s.courier.courier_name,
        shipping_fee: s.courier.rate_amount,
      }));

      const payload: CreateOrderPayload = {
        items,
        selected_shipping,
        selected_fabric_transfers: selected_fabric_transfers.length > 0
          ? selected_fabric_transfers
          : undefined,
        address_id: addressId,
        payment_method: paymentMethod,
      };

      const res = await api.post('/orders', payload);
      const data: OrderResponse = res.data?.data ?? res.data;
      setOrderResult(data);

      // Handle Paystack redirect
      if (paymentMethod === 'paystack' && data.authorization_url) {
        window.location.href = data.authorization_url;
        return data;
      }

      // Wallet payment — order is complete
      clearCart();
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to place order';
      setError(msg);
      return null;
    } finally {
      setPlacing(false);
    }
  }, [preview, isReady, cart, selectedCouriers, selectedFabricCouriers, clearCart]);

  // ── Reset ──────────────────────────────────────────────────
  const reset = useCallback(() => {
    setPreview(null);
    setSelectedCouriers([]);
    setSelectedFabricCouriers([]);
    setError(null);
    setOrderResult(null);
  }, []);

  return {
    // State
    preview,
    loading,
    placing,
    error,
    orderResult,

    // Courier selections
    selectedCouriers,
    selectedFabricCouriers,
    selectCourier,
    selectFabricCourier,

    // Computed
    totalShipping,
    total,
    isReady,

    // Actions
    fetchPreview,
    placeOrder,
    reset,
  };
}
