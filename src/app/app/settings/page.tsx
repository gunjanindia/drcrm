'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Settings,
  Shield,
  Receipt,
  Layers,
  Package as PackageIcon,
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Save,
  Clock,
  DollarSign,
  Briefcase,
  Share2,
  Mail,
  UserCheck,
  Lock,
  Phone,
} from 'lucide-react';
import { Button, Input, Modal, Badge } from '@/components/ui';
import { globalStore } from '@/lib/store';
import { globalTaxEngine } from '@/lib/tax-engine';
import { User, UserRole, Service, Package, BillingFrequency } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';

export default function MasterDataSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'staff' | 'services' | 'packages' | 'tax' | 'sources'>('profile');

  // --- CURRENT USER PROFILE STATE ---
  const [myProfile, setMyProfile] = useState<any>(null);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- PASSWORD UPDATE STATE ---
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Local state reflecting globalStore
  const [users, setUsers] = useState<User[]>(globalStore.users);
  const [services, setServices] = useState<Service[]>(globalStore.services);
  const [packages, setPackages] = useState<Package[]>(globalStore.packages);
  const [leadSources, setLeadSources] = useState<string[]>(globalStore.leadSources);
  const [taxConfig, setTaxConfig] = useState(globalStore.taxConfig);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) {
          setMyProfile(d.user);
          setProfileName(d.user.name || '');
          setProfileEmail(d.user.email || '');
          setProfilePhone(d.user.phone || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEmail.trim()) return;

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification(data.error || 'Failed to update email');
      } else {
        showNotification('Profile and Email updated successfully!');
        setMyProfile(data.user);
        setUsers([...globalStore.users]);
      }
    } catch {
      showNotification('Network error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmNewPwd) return;

    if (newPwd.length < 6) {
      showNotification('New password must be at least 6 characters long');
      return;
    }

    if (newPwd !== confirmNewPwd) {
      showNotification('New passwords do not match');
      return;
    }

    setIsChangingPwd(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword: currentPwd,
          newPassword: newPwd,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification(data.error || 'Failed to update password');
      } else {
        showNotification('Password changed successfully!');
        setCurrentPwd('');
        setNewPwd('');
        setConfirmNewPwd('');
      }
    } catch {
      showNotification('Network error updating password');
    } finally {
      setIsChangingPwd(false);
    }
  };

  // --- STAFF MODAL STATES ---
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('DELIVERY_EXECUTIVE');
  const [staffDept, setStaffDept] = useState('Operations');
  const [isSavingStaff, setIsSavingStaff] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setUsers([...globalStore.users]);
      }
    } catch {
      setUsers([...globalStore.users]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- SERVICE MODAL STATES ---
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvSlug, setSrvSlug] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvPrice, setSrvPrice] = useState(499);
  const [srvBilling, setSrvBilling] = useState<BillingFrequency>('ONE_TIME');
  const [srvCat, setSrvCat] = useState<'GBP' | 'SEO' | 'WEBSITE' | 'REVIEWS' | 'SOCIAL' | 'AUDIT'>('GBP');
  const [srvSla, setSrvSla] = useState(48);
  const [srvDeliverables, setSrvDeliverables] = useState('Verified Listing, Category Setup');

  // --- PACKAGE MODAL STATES ---
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgCode, setPkgCode] = useState('');
  const [pkgTagline, setPkgTagline] = useState('');
  const [pkgPrice, setPkgPrice] = useState(999);
  const [pkgBilling, setPkgBilling] = useState<BillingFrequency>('ONE_TIME');
  const [pkgFeatures, setPkgFeatures] = useState('Google Maps Setup\nReview QR Stand\nWhatsApp Integration');
  const [pkgIsPopular, setPkgIsPopular] = useState(false);

  // --- LEAD SOURCE STATE ---
  const [newSource, setNewSource] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- STAFF ACTIONS ---
  const handleOpenAddStaff = () => {
    setEditingUser(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setStaffPassword('');
    setStaffRole('DELIVERY_EXECUTIVE');
    setStaffDept('Operations');
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (u: User) => {
    setEditingUser(u);
    setStaffName(u.name);
    setStaffEmail(u.email);
    setStaffPhone(u.phone);
    setStaffPassword('');
    setStaffRole(u.role);
    setStaffDept(u.department || 'Operations');
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPhone) return;

    setIsSavingStaff(true);
    try {
      const payload = {
        id: editingUser ? editingUser.id : undefined,
        name: staffName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim(),
        role: staffRole,
        department: staffDept.trim(),
        password: staffPassword.trim() || undefined,
      };

      const res = await fetch('/api/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(data.message || (editingUser ? `Updated staff member ${staffName}` : `Added new staff member ${staffName}`));
        await fetchUsers();
        setIsStaffModalOpen(false);
      } else {
        showNotification(data.error || 'Failed to save staff member');
      }
    } catch {
      // Fallback in memory
      if (editingUser) {
        globalStore.updateUser(editingUser.id, {
          name: staffName,
          email: staffEmail,
          phone: staffPhone,
          role: staffRole,
          department: staffDept,
        });
        showNotification(`Updated staff member ${staffName}`);
      } else {
        globalStore.createUser({
          name: staffName,
          email: staffEmail,
          phone: staffPhone,
          role: staffRole,
          department: staffDept,
        });
        showNotification(`Added new staff member ${staffName} (Default Password: Password@123)`);
      }
      setUsers([...globalStore.users]);
      setIsStaffModalOpen(false);
    } finally {
      setIsSavingStaff(false);
    }
  };

  const handleDeleteStaff = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to remove staff member "${name}"?`)) {
      try {
        await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      } catch {}
      globalStore.deleteUser(userId);
      await fetchUsers();
      showNotification(`Removed staff member ${name}`);
    }
  };

  // --- SERVICE ACTIONS ---
  const handleOpenAddService = () => {
    setEditingService(null);
    setSrvName('');
    setSrvSlug('');
    setSrvDesc('');
    setSrvPrice(499);
    setSrvBilling('ONE_TIME');
    setSrvCat('GBP');
    setSrvSla(48);
    setSrvDeliverables('');
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (s: Service) => {
    setEditingService(s);
    setSrvName(s.name);
    setSrvSlug(s.slug);
    setSrvDesc(s.description);
    setSrvPrice(s.basePrice);
    setSrvBilling(s.billingType);
    setSrvCat(s.category);
    setSrvSla(s.defaultSlaHours);
    setSrvDeliverables(s.deliverables.join(', '));
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName) return;

    const delivArray = srvDeliverables.split(',').map((d) => d.trim()).filter(Boolean);

    if (editingService) {
      globalStore.updateService(editingService.id, {
        name: srvName,
        slug: srvSlug || srvName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: srvDesc,
        basePrice: srvPrice,
        billingType: srvBilling,
        category: srvCat,
        defaultSlaHours: srvSla,
        deliverables: delivArray,
      });
      showNotification(`Updated service: ${srvName}`);
    } else {
      globalStore.createService({
        name: srvName,
        slug: srvSlug || srvName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: srvDesc,
        basePrice: srvPrice,
        billingType: srvBilling,
        category: srvCat,
        defaultSlaHours: srvSla,
        deliverables: delivArray,
        isActive: true,
      });
      showNotification(`Added new service: ${srvName}`);
    }

    setServices([...globalStore.services]);
    setIsServiceModalOpen(false);
  };

  const handleDeleteService = (srvId: string, name: string) => {
    if (confirm(`Remove service "${name}" from master catalogue?`)) {
      globalStore.deleteService(srvId);
      setServices([...globalStore.services]);
      showNotification(`Removed service ${name}`);
    }
  };

  // --- PACKAGE ACTIONS ---
  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setPkgName('');
    setPkgCode('');
    setPkgTagline('');
    setPkgPrice(999);
    setPkgBilling('ONE_TIME');
    setPkgFeatures('');
    setPkgIsPopular(false);
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (p: Package) => {
    setEditingPackage(p);
    setPkgName(p.name);
    setPkgCode(p.code);
    setPkgTagline(p.tagline);
    setPkgPrice(p.price);
    setPkgBilling(p.billingFrequency);
    setPkgFeatures(p.features.join('\n'));
    setPkgIsPopular(Boolean(p.isPopular));
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName) return;

    const feats = pkgFeatures.split('\n').map((f) => f.trim()).filter(Boolean);

    if (editingPackage) {
      globalStore.updatePackage(editingPackage.id, {
        name: pkgName,
        code: pkgCode || pkgName.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
        tagline: pkgTagline,
        price: pkgPrice,
        billingFrequency: pkgBilling,
        features: feats,
        isPopular: pkgIsPopular,
      });
      showNotification(`Updated package: ${pkgName}`);
    } else {
      globalStore.createPackage({
        name: pkgName,
        code: pkgCode || pkgName.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
        tagline: pkgTagline,
        price: pkgPrice,
        billingFrequency: pkgBilling,
        serviceIds: ['srv_gbp_setup', 'srv_review_qr'],
        features: feats,
        isPopular: pkgIsPopular,
        isActive: true,
      });
      showNotification(`Added new package: ${pkgName}`);
    }

    setPackages([...globalStore.packages]);
    setIsPackageModalOpen(false);
  };

  const handleDeletePackage = (pkgId: string, name: string) => {
    if (confirm(`Remove package "${name}" from pricing system?`)) {
      globalStore.deletePackage(pkgId);
      setPackages([...globalStore.packages]);
      showNotification(`Removed package ${name}`);
    }
  };

  // --- LEAD SOURCE ACTIONS ---
  const handleAddLeadSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.trim()) return;
    globalStore.addLeadSource(newSource.trim());
    setLeadSources([...globalStore.leadSources]);
    setNewSource('');
    showNotification(`Added lead source: ${newSource}`);
  };

  const handleDeleteLeadSource = (src: string) => {
    globalStore.deleteLeadSource(src);
    setLeadSources([...globalStore.leadSources]);
    showNotification(`Removed lead source: ${src}`);
  };

  // --- TAX CONFIG ACTION ---
  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = globalTaxEngine.updateConfig(taxConfig);
    globalStore.taxConfig = updated;
    setTaxConfig({ ...updated });
    showNotification('Tax configuration updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" />
          Super Admin Control Panel
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Master Data Management Center
        </h2>
        <p className="text-xs text-slate-500">
          Full interactive CRUD management for Staff RBAC, Services, Packages, Tax Regimes, and Lead Channels. No code or seed edits required.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'profile', label: 'My Account & Email', icon: UserCheck },
          { id: 'staff', label: `Staff & RBAC (${users.length})`, icon: Users },
          { id: 'services', label: `Services Catalogue (${services.length})`, icon: Layers },
          { id: 'packages', label: `Packages & Pricing (${packages.length})`, icon: PackageIcon },
          { id: 'tax', label: 'Business Tax Regime', icon: Receipt },
          { id: 'sources', label: `Lead Sources (${leadSources.length})`, icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: MY ACCOUNT & EMAIL UPDATE */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in max-w-4xl">
          {/* Profile & Email Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Personal Profile & Email Address
                </h3>
                <p className="text-xs text-slate-500">
                  Update your login email address, contact phone number, and display name.
                </p>
              </div>
              {myProfile && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Role: {myProfile.role}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  type="text"
                  placeholder="Your full name"
                  icon={Users}
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />

                <Input
                  label="Login Email Address *"
                  type="email"
                  placeholder="your.email@digitalranchi.in"
                  icon={Mail}
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone / WhatsApp Number *"
                  type="tel"
                  placeholder="+91 98765 43210"
                  icon={Phone}
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  required
                />

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                    Department
                  </label>
                  <input
                    type="text"
                    disabled
                    value={myProfile?.department || 'Executive'}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-2.5 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Save}
                  isLoading={isSavingProfile}
                  className="shadow-indigo-600/30"
                >
                  Save Profile & Update Email
                </Button>
              </div>
            </form>
          </div>

          {/* Account Password Change Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                Change Password
              </h3>
              <p className="text-xs text-slate-500">
                Update your account password. Must be at least 6 characters.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Current Password *"
                  type="password"
                  placeholder="••••••••••••"
                  icon={Lock}
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  required
                />

                <Input
                  label="New Password *"
                  type="password"
                  placeholder="Minimum 6 characters"
                  icon={Lock}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  required
                />

                <Input
                  label="Confirm New Password *"
                  type="password"
                  placeholder="Re-enter new password"
                  icon={Lock}
                  value={confirmNewPwd}
                  onChange={(e) => setConfirmNewPwd(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  icon={CheckCircle2}
                  isLoading={isChangingPwd}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: STAFF & TEAM RBAC MASTER DATA */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Active Staff Accounts & Role Allocations
              </h3>
              <p className="text-[11px] text-slate-500">
                Manage executive, sales, delivery, and finance access permissions
              </p>
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAddStaff}>
              Add Staff Member
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <span className="text-[11px] text-slate-500">{u.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {u.department || 'Operations'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{u.phone}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditStaff(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Staff"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDeleteStaff(u.id, u.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SERVICES CATALOGUE MASTER DATA */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Service Catalog & Deliverable SOP Master Data
              </h3>
              <p className="text-[11px] text-slate-500">
                Configure service pricing, categories, SLA timers, and deliverable commitments
              </p>
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAddService}>
              Add New Service
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 uppercase text-slate-600 dark:text-slate-300">
                      {s.category}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatINR(s.basePrice)}
                      <span className="text-[10px] font-normal text-slate-500">
                        {s.billingType === 'MONTHLY' ? '/mo' : ' one-time'}
                      </span>
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{s.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{s.description}</p>

                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Deliverables:</span>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                      {s.deliverables.map((d, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-emerald-500">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">SLA: {s.defaultSlaHours}h</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditService(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(s.id, s.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PACKAGES & PRICING MASTER DATA */}
      {/* ========================================================================= */}
      {activeTab === 'packages' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Package Master Data & Pricing Grid
              </h3>
              <p className="text-[11px] text-slate-500">
                Configure public packages (Starter ₹499, Growth ₹999, Premium ₹2,499/mo) and custom retainers
              </p>
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAddPackage}>
              Add Package
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {packages.map((p) => (
              <div
                key={p.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{p.code}</span>
                    {p.isPopular && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 uppercase border border-amber-500/30">
                        Popular
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">{p.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{p.tagline}</p>

                  <div className="my-3 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {formatINR(p.price)}
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      {p.billingFrequency === 'MONTHLY' ? '/month' : 'one-time'}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <Button variant="outline" size="sm" icon={Edit2} onClick={() => handleOpenEditPackage(p)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => handleDeletePackage(p.id, p.name)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TAX CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === 'tax' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in max-w-3xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Business Tax & Invoicing Master Configuration
              </h3>
              <p className="text-[11px] text-slate-500">
                Decoupled engine currently operating in Non-GST mode, ready for future GST activation.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveTax} className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                id="gstSwitch"
                checked={taxConfig.isGstRegistered}
                onChange={(e) =>
                  setTaxConfig({
                    ...taxConfig,
                    isGstRegistered: e.target.checked,
                    defaultTaxMode: e.target.checked ? 'GST' : 'NON_GST',
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="gstSwitch" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                Enable GST Registered Mode (Currently Default: NO / Non-GST)
              </label>
            </div>

            {taxConfig.isGstRegistered && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                <Input
                  label="GSTIN"
                  placeholder="20ABCDE1234F1Z5"
                  value={taxConfig.gstin || ''}
                  onChange={(e) => setTaxConfig({ ...taxConfig, gstin: e.target.value })}
                />
                <Input
                  label="SAC Code"
                  value={taxConfig.defaultSacCode}
                  onChange={(e) => setTaxConfig({ ...taxConfig, defaultSacCode: e.target.value })}
                />
                <Input
                  label="CGST (%)"
                  type="number"
                  value={taxConfig.cgstRatePercent}
                  onChange={(e) =>
                    setTaxConfig({ ...taxConfig, cgstRatePercent: parseFloat(e.target.value) || 0 })
                  }
                />
                <Input
                  label="SGST (%)"
                  type="number"
                  value={taxConfig.sgstRatePercent}
                  onChange={(e) =>
                    setTaxConfig({ ...taxConfig, sgstRatePercent: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            )}

            <Input
              label="Invoice Prefix"
              value={taxConfig.invoicePrefix}
              onChange={(e) => setTaxConfig({ ...taxConfig, invoicePrefix: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Invoice Terms & Legal Note
              </label>
              <textarea
                rows={2}
                value={taxConfig.termsAndConditions}
                onChange={(e) => setTaxConfig({ ...taxConfig, termsAndConditions: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" icon={Save}>
                Save Tax Configuration
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LEAD SOURCES MASTER DATA */}
      {/* ========================================================================= */}
      {activeTab === 'sources' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in max-w-2xl">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Lead Acquisition Channels & Attribution Sources
            </h3>
            <p className="text-[11px] text-slate-500">
              Track conversion analytics across website audits, WhatsApp, field sales, and paid campaigns
            </p>
          </div>

          <form onSubmit={handleAddLeadSource} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Newspaper Ad, Trade Expo, Radio"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button type="submit" variant="primary" size="sm" icon={Plus}>
              Add Source
            </Button>
          </form>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {leadSources.map((src) => (
              <div key={src} className="py-2.5 flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{src}</span>
                <button
                  onClick={() => handleDeleteLeadSource(src)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Remove Source"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAFF ADD/EDIT MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title={editingUser ? `Edit Staff Member: ${editingUser.name}` : 'Add New Staff Member'}
        description="Allocate role and department permissions for internal CRM access."
      >
        <form onSubmit={handleSaveStaff} className="space-y-3.5 text-xs">
          <Input
            label="Full Name *"
            placeholder="e.g. Ankit Sharma"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            required
          />
          <Input
            label="Email Address *"
            type="email"
            placeholder="ankit.s@digitalranchi.in"
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            required
          />
          <Input
            label="Phone / WhatsApp Number *"
            placeholder="+91 98765 43210"
            value={staffPhone}
            onChange={(e) => setStaffPhone(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                RBAC Role *
              </label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="BUSINESS_ADMIN">Business Admin</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="SALES_EXECUTIVE">Sales Executive</option>
                <option value="OPERATIONS_MANAGER">Operations Manager</option>
                <option value="ACCOUNT_MANAGER">Account Manager</option>
                <option value="DELIVERY_EXECUTIVE">Delivery Executive</option>
                <option value="FINANCE">Finance</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                Department
              </label>
              <input
                type="text"
                value={staffDept}
                onChange={(e) => setStaffDept(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                placeholder="e.g. Design, Sales, SEO"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
              {editingUser ? 'Set New Password (Optional)' : 'Initial Password (Optional)'}
            </label>
            <input
              type="password"
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
              placeholder={editingUser ? 'Leave blank to keep unchanged' : 'Default: Password@123'}
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {editingUser
                ? 'Leave empty to retain existing password.'
                : 'If left blank, default login password will be Password@123'}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save} isLoading={isSavingStaff}>
              Save Staff Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* SERVICE ADD/EDIT MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title={editingService ? `Edit Service: ${editingService.name}` : 'Add New Service to Catalog'}
        description="Define service deliverables, base pricing, and standard operating SLA."
      >
        <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
          <Input
            label="Service Name *"
            placeholder="e.g. Video Reels Creation"
            value={srvName}
            onChange={(e) => setSrvName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Base Price (INR) *"
              type="number"
              value={srvPrice}
              onChange={(e) => setSrvPrice(parseInt(e.target.value) || 0)}
              required
            />
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                Billing Type
              </label>
              <select
                value={srvBilling}
                onChange={(e) => setSrvBilling(e.target.value as BillingFrequency)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="ONE_TIME">One Time</option>
                <option value="MONTHLY">Monthly Retainer</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                Category
              </label>
              <select
                value={srvCat}
                onChange={(e) => setSrvCat(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="GBP">Google Maps / GBP</option>
                <option value="REVIEWS">Review Management</option>
                <option value="WEBSITE">Mini Website</option>
                <option value="SEO">Local SEO</option>
                <option value="SOCIAL">Social Media</option>
                <option value="AUDIT">Presence Audit</option>
              </select>
            </div>
            <Input
              label="Default SLA (Hours)"
              type="number"
              value={srvSla}
              onChange={(e) => setSrvSla(parseInt(e.target.value) || 24)}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
              Deliverables (Comma Separated)
            </label>
            <input
              type="text"
              value={srvDeliverables}
              onChange={(e) => setSrvDeliverables(e.target.value)}
              placeholder="e.g. 4 HD Reels, Captions, Hashtags"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
              Description
            </label>
            <textarea
              rows={2}
              value={srvDesc}
              onChange={(e) => setSrvDesc(e.target.value)}
              placeholder="Short summary of service scope..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsServiceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Service
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* PACKAGE ADD/EDIT MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        title={editingPackage ? `Edit Package: ${editingPackage.name}` : 'Add New Package'}
        description="Configure package price, billing cadence, and customer-facing features."
      >
        <form onSubmit={handleSavePackage} className="space-y-3.5 text-xs">
          <Input
            label="Package Name *"
            placeholder="e.g. Elite Hyperlocal Dominance"
            value={pkgName}
            onChange={(e) => setPkgName(e.target.value)}
            required
          />
          <Input
            label="Tagline / Short Summary"
            placeholder="e.g. Complete 360 monthly growth system"
            value={pkgTagline}
            onChange={(e) => setPkgTagline(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (INR) *"
              type="number"
              value={pkgPrice}
              onChange={(e) => setPkgPrice(parseInt(e.target.value) || 0)}
              required
            />
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                Frequency
              </label>
              <select
                value={pkgBilling}
                onChange={(e) => setPkgBilling(e.target.value as BillingFrequency)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="ONE_TIME">One Time Setup</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
              Features (One per line)
            </label>
            <textarea
              rows={4}
              value={pkgFeatures}
              onChange={(e) => setPkgFeatures(e.target.value)}
              placeholder="Google Maps Optimization&#10;Review QR Acrylic Stand&#10;1-Page Mini Website"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="popPkg"
              checked={pkgIsPopular}
              onChange={(e) => setPkgIsPopular(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <label htmlFor="popPkg" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              Mark as "Most Popular" on public website
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsPackageModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Package
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
