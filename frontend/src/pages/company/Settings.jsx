import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI, uploadAPI, subscriptionAPI, paymentsAPI } from '../../lib/api';
import { PageLoading, ErrorState } from '../../components/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Settings as SettingsIcon, Building2, Palette, Tag, Plus, Trash2, Upload, CreditCard, CheckCircle2, Clock, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'profile');

  const handleTabChange = (value) => {
    setTab(value);
    setSearchParams({ tab: value }, { replace: true });
  };

  // Company profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['company-profile'],
    queryFn: () => settingsAPI.get(),
  });

  // Categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => settingsAPI.getCategories(),
  });

  const profile = profileData?.data?.data;
  const categories = categoriesData?.data?.data || [];

  if (profileLoading || categoriesLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage company profile, preferences, and categories</p>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="profile">
            <Building2 className="h-4 w-4 mr-1" /> Profile
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="h-4 w-4 mr-1" /> Branding
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="h-4 w-4 mr-1" /> Categories
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-1" /> Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab profile={profile} queryClient={queryClient} />
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <BrandingTab profile={profile} queryClient={queryClient} />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesTab categories={categories} queryClient={queryClient} />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileTab({ profile, queryClient }) {
  const [form, setForm] = useState({
    name: profile?.name || '',
    industry: profile?.industry || '',
    website: profile?.website || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    address: profile?.address || '',
    city: profile?.city || '',
    country: profile?.country || 'Ghana',
    description: profile?.description || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data) => settingsAPI.updateProfile(data),
    onSuccess: () => queryClient.invalidateQueries(['company-profile']),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          Company Profile
        </CardTitle>
        <CardDescription>Basic information about your company</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={form.industry} onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={updateMutation.isPending} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 border-0">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          {updateMutation.isSuccess && (
            <p className="text-sm text-green-600">Profile updated successfully!</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function BrandingTab({ profile, queryClient }) {
  const [primaryColor, setPrimaryColor] = useState(profile?.settings?.primaryColor || '#6366f1');
  const [uploading, setUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => settingsAPI.updatePreferences(data),
    onSuccess: () => queryClient.invalidateQueries(['company-profile']),
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAPI.uploadLogo(file);
      queryClient.invalidateQueries(['company-profile']);
    } catch (err) {
      console.error('Logo upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Upload className="h-4 w-4 text-white" />
            </div>
            Company Logo
          </CardTitle>
          <CardDescription>Upload your company logo for the complaint portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-xl border-2 border-dashed border-violet-200 dark:border-violet-800/50 flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/20 overflow-hidden">
              {profile?.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <Button variant="outline" asChild disabled={uploading}>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </span>
                </Button>
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 2MB. Recommended 200×200px.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Palette className="h-4 w-4 text-white" />
            </div>
            Brand Colors
          </CardTitle>
          <CardDescription>Customize the complaint portal appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 font-mono"
                />
              </div>
            </div>
          </div>
          <Button
            className="mt-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 border-0"
            onClick={() => updateMutation.mutate({ primaryColor })}
            disabled={updateMutation.isPending}
          >
            Save Branding
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesTab({ categories, queryClient }) {
  const [newCategory, setNewCategory] = useState('');

  const createMutation = useMutation({
    mutationFn: (name) => settingsAPI.createCategory({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setNewCategory('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => settingsAPI.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries(['categories']),
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Tag className="h-4 w-4 text-white" />
          </div>
          Complaint Categories
        </CardTitle>
        <CardDescription>Manage the categories available for complaints</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="New category name..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newCategory.trim()) {
                e.preventDefault();
                createMutation.mutate(newCategory.trim());
              }
            }}
          />
          <Button
            onClick={() => {
              if (newCategory.trim()) createMutation.mutate(newCategory.trim());
            }}
            disabled={!newCategory.trim() || createMutation.isPending}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No categories. Add your first one above.</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl border-0 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-800/20 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Tag className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm font-medium">{cat.name}</span>
                  {cat.isDefault && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{cat._count?.complaints || 0} complaints</span>
                  {!cat.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        if (window.confirm(`Delete category "${cat.name}"?`)) {
                          deleteMutation.mutate(cat.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BILLING TAB
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', variant: 'default', icon: CheckCircle2, color: 'text-green-600' },
  TRIALING: { label: 'Free Trial', variant: 'secondary', icon: Clock, color: 'text-blue-600' },
  PENDING_PAYMENT: { label: 'Payment Required', variant: 'warning', icon: AlertCircle, color: 'text-amber-600' },
  EXPIRED: { label: 'Expired', variant: 'destructive', icon: AlertCircle, color: 'text-red-600' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive', icon: AlertCircle, color: 'text-red-600' },
  PAST_DUE: { label: 'Past Due', variant: 'destructive', icon: AlertCircle, color: 'text-red-600' },
};

function BillingTab() {
  const [loadingGateway, setLoadingGateway] = useState(null);

  const { data: subData, isLoading: subLoading, refetch: refetchSub } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => subscriptionAPI.getMySubscription(),
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: () => paymentsAPI.getMyTransactions({ limit: 10 }),
  });

  const subscription = subData?.data?.data;
  const transactions = txData?.data?.data || [];

  const handlePay = async (gateway) => {
    setLoadingGateway(gateway);
    try {
      const { data } = await paymentsAPI.initialize(gateway);
      const { checkoutUrl, providerReference, transactionId } = data.data;
      sessionStorage.setItem('payment_reference', providerReference);
      sessionStorage.setItem('payment_gateway', gateway);
      sessionStorage.setItem('payment_transaction_id', transactionId ?? '');
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initialise payment. Try again.');
    } finally {
      setLoadingGateway(null);
    }
  };

  const handleRefresh = async () => {
    await refetchSub();
    toast.success('Subscription status refreshed');
  };

  if (subLoading) return <PageLoading />;

  const status = subscription?.status;
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.EXPIRED;
  const StatusIcon = statusCfg.icon;

  const now = new Date();
  const trialExpired =
    status === 'TRIALING' &&
    subscription?.trialEndsAt &&
    now > new Date(subscription.trialEndsAt);

  const isPayable = status !== 'ACTIVE' && status !== 'TRIALING' || trialExpired;
  const trialDaysLeft =
    status === 'TRIALING' && subscription?.trialEndsAt && !trialExpired
      ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - now) / 86400000))
      : null;

  const plan = subscription?.subscriptionPlan;

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const fmtAmount = (amount) => `GHS ${(amount / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Subscription status card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              Subscription
            </CardTitle>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh status
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {!subscription ? (
            <p className="text-sm text-muted-foreground">No subscription found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan</p>
                <p className="font-semibold">{plan?.name ?? '—'}</p>
                <p className="text-sm text-muted-foreground">
                  {plan?.price === 0 ? 'Free' : `GHS ${plan?.price}/mo`}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                <div className={`flex items-center gap-1.5 font-semibold ${statusCfg.color}`}>
                  <StatusIcon className="h-4 w-4" />
                  {trialExpired ? 'Trial Expired' : statusCfg.label}
                </div>
                {trialDaysLeft !== null && (
                  <p className="text-xs text-muted-foreground">{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Period</p>
                {status === 'TRIALING' ? (
                  <p className="text-sm">
                    Trial ends {fmtDate(subscription.trialEndsAt)}
                  </p>
                ) : status === 'ACTIVE' ? (
                  <p className="text-sm">
                    Renews {fmtDate(subscription.currentPeriodEnd)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
          )}

          {/* Upgrade / payment buttons */}
          {(isPayable || status === 'PENDING_PAYMENT') && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm font-medium mb-3">
                {status === 'PENDING_PAYMENT'
                  ? 'Complete your payment to activate'
                  : 'Upgrade to Enterprise Monthly — GHS 299/mo'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handlePay('PAYSTACK')}
                  disabled={!!loadingGateway}
                  className="gap-2 font-medium"
                  style={{ background: '#00c3a0', color: '#fff' }}
                >
                  {loadingGateway === 'PAYSTACK'
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <CreditCard className="h-4 w-4" />}
                  {loadingGateway === 'PAYSTACK' ? 'Redirecting...' : 'Pay with Paystack (GHS)'}
                </Button>
                <Button
                  onClick={() => handlePay('STRIPE')}
                  disabled={!!loadingGateway}
                  className="gap-2 font-medium"
                  style={{ background: '#635bff', color: '#fff' }}
                >
                  {loadingGateway === 'STRIPE'
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <CreditCard className="h-4 w-4" />}
                  {loadingGateway === 'STRIPE' ? 'Redirecting...' : 'Pay with Stripe (USD)'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Payment History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Gateway</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 text-muted-foreground">{fmtDate(tx.createdAt)}</td>
                      <td className="py-2.5 pr-4 capitalize">{tx.gateway?.toLowerCase()}</td>
                      <td className="py-2.5 pr-4 font-medium">{fmtAmount(tx.amount)}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          tx.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : tx.status === 'FAILED'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
