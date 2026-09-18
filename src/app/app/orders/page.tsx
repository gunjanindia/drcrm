'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Search,
  Filter,
  MapPin,
  Smartphone,
  Radio,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { StandeeOrder, StandeeOrderStatus } from '@/types';

export default function AdminStandeeOrdersPage() {
  const [orders, setOrders] = useState<StandeeOrder[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, newOrders: 0, inProduction: 0, dispatched: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | StandeeOrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Provisioning / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<StandeeOrder | null>(null);
  const [modalClientId, setModalClientId] = useState('');
  const [modalStatus, setModalStatus] = useState<StandeeOrderStatus>('IN_PRODUCTION');
  const [modalCourier, setModalCourier] = useState<'Delhivery' | 'BlueDart' | 'DTDC' | 'India Post'>('Delhivery');
  const [modalTrackingId, setModalTrackingId] = useState('');
  const [modalNfcUid, setModalNfcUid] = useState('');
  const [modalQrSlug, setModalQrSlug] = useState('');
  const [modalAddress, setModalAddress] = useState('');
  const [modalCity, setModalCity] = useState('');
  const [modalPincode, setModalPincode] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = () => {
    fetch('/api/admin/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setOrders(data.data.orders || []);
          setStats(data.data.stats || {});
          setClients(data.data.clients || []);
        }
      })
      .catch((err) => console.error('Error loading admin orders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openProvisionModal = (order?: StandeeOrder) => {
    if (order) {
      setEditingOrder(order);
      setModalClientId(order.clientId);
      setModalStatus(order.status);
      setModalCourier((order.courier as any) || 'Delhivery');
      setModalTrackingId(order.trackingId || '');
      setModalNfcUid(order.nfcUid || '');
      setModalQrSlug(order.qrSlug || '');
      setModalAddress(order.shippingAddress || '');
      setModalCity(order.city || '');
      setModalPincode(order.pincode || '');
      setModalPhone(order.phone || '');
      setModalNotes(order.notes || '');
    } else {
      setEditingOrder(null);
      const defaultClient = clients[0];
      setModalClientId(defaultClient?.id || '');
      setModalStatus('IN_PRODUCTION');
      setModalCourier('Delhivery');
      setModalTrackingId('');
      setModalNfcUid(`NFC-DR-${Math.floor(1000000 + Math.random() * 9000000)}`);
      setModalQrSlug(defaultClient?.businessName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || '');
      setModalAddress(defaultClient?.address || '');
      setModalCity(defaultClient?.city || 'Ranchi');
      setModalPincode('834001');
      setModalPhone(defaultClient?.phone || '');
      setModalNotes('Provisioned for Client 360 countertop.');
    }
    setIsModalOpen(true);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingOrder) {
        // Update
        await fetch('/api/admin/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: editingOrder.id,
            status: modalStatus,
            courier: modalCourier,
            trackingId: modalTrackingId,
            nfcUid: modalNfcUid,
            qrSlug: modalQrSlug,
            shippingAddress: modalAddress,
            notes: modalNotes,
          }),
        });
      } else {
        // Create
        await fetch('/api/admin/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: modalClientId,
            status: modalStatus,
            courier: modalCourier,
            trackingId: modalTrackingId,
            nfcUid: modalNfcUid,
            qrSlug: modalQrSlug,
            shippingAddress: modalAddress,
            city: modalCity,
            pincode: modalPincode,
            phone: modalPhone,
            notes: modalNotes,
          }),
        });
      }
      setIsModalOpen(false);
      fetchOrders();
    } catch (err) {
      console.error('Error saving standee order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = activeFilter === 'ALL' || o.status === activeFilter;
    const matchesSearch =
      !searchQuery ||
      o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.trackingId && o.trackingId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.nfcUid && o.nfcUid.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Hardware Logistics Desk
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Standee Fulfillment & Provisioning Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fulfill physical acrylic standees across India, assign NFC chip UIDs, pair dynamic review slugs, and track AWB delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openProvisionModal()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Provision New Standee
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Standees</span>
          <span className="text-xl font-black text-white">{stats.total || orders.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">New Orders</span>
          <span className="text-xl font-black text-amber-400">{stats.newOrders || 0}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">In Production</span>
          <span className="text-xl font-black text-indigo-400">{stats.inProduction || 0}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Dispatched (In Transit)</span>
          <span className="text-xl font-black text-purple-400">{stats.dispatched || 0}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Delivered Live</span>
          <span className="text-xl font-black text-emerald-400">{stats.delivered || 0}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
          {(['ALL', 'ORDER_PLACED', 'IN_PRODUCTION', 'DISPATCHED', 'DELIVERED'] as const).map((filter) => {
            const active = activeFilter === filter;
            const label =
              filter === 'ALL'
                ? 'All Orders'
                : filter === 'ORDER_PLACED'
                ? 'New Orders'
                : filter === 'IN_PRODUCTION'
                ? 'In Production'
                : filter === 'DISPATCHED'
                ? 'Dispatched'
                : 'Delivered';

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant, AWB, or NFC UID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Client & Destination</th>
                <th className="px-5 py-3.5">Fulfillment Status</th>
                <th className="px-5 py-3.5">Carrier & AWB</th>
                <th className="px-5 py-3.5">NFC UID & QR Slug</th>
                <th className="px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    No standee orders found matching your search or filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white text-xs">{item.clientName}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                        {item.shippingAddress}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          item.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : item.status === 'DISPATCHED'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : item.status === 'IN_PRODUCTION'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.trackingId ? (
                        <div>
                          <span className="font-semibold text-white block">{item.courier || 'Express Air'}</span>
                          <span className="font-mono text-[10px] text-indigo-400">{item.trackingId}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Pending Shipment</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <span className="font-mono text-[11px] text-purple-300 block">{item.nfcUid || 'Unassigned'}</span>
                        <a
                          href={`/r/${item.qrSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-slate-400 hover:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          /r/{item.qrSlug} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openProvisionModal(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700"
                      >
                        Edit / Dispatch
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROVISIONING / DISPATCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-indigo-400" />
                {editingOrder ? `Update Standee (${editingOrder.clientName})` : 'Provision New Acrylic Standee'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-3">
              {!editingOrder && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Select Client Business
                  </label>
                  <select
                    value={modalClientId}
                    onChange={(e) => {
                      setModalClientId(e.target.value);
                      const sel = clients.find((c) => c.id === e.target.value);
                      if (sel) {
                        setModalQrSlug(sel.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                        setModalAddress(sel.address || `${sel.city}, Jharkhand`);
                        setModalCity(sel.city || 'Ranchi');
                        setModalPhone(sel.phone || '');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Fulfillment Stage
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as StandeeOrderStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ORDER_PLACED">Order Placed</option>
                    <option value="IN_PRODUCTION">In Production</option>
                    <option value="DISPATCHED">Dispatched (Shipped)</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={modalCourier}
                    onChange={(e) => setModalCourier(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Delhivery">Delhivery</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="DTDC">DTDC</option>
                    <option value="India Post">India Post</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  AWB / Courier Tracking ID
                </label>
                <input
                  type="text"
                  value={modalTrackingId}
                  onChange={(e) => setModalTrackingId(e.target.value)}
                  placeholder="e.g. BD74892019IN"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    NFC Chip UID
                  </label>
                  <input
                    type="text"
                    value={modalNfcUid}
                    onChange={(e) => setModalNfcUid(e.target.value)}
                    placeholder="NFC-DR-8829104"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Dynamic QR Slug (/r/slug)
                  </label>
                  <input
                    type="text"
                    value={modalQrSlug}
                    onChange={(e) => setModalQrSlug(e.target.value)}
                    placeholder="city-dental-care"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Shipping Destination Address
                </label>
                <textarea
                  value={modalAddress}
                  onChange={(e) => setModalAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  {submitting ? 'Saving...' : 'Save Hardware Provisioning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
