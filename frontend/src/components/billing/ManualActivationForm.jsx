import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Hash,
  Phone,
  Smartphone,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card';

const PLAN_OPTIONS = [
  { value: 'STARTER', label: 'Starter', price: 'GHS 150/month' },
  { value: 'ENTERPRISE', label: 'Enterprise', price: 'GHS 500/month' },
];
const PLAN_DEFAULT_AMOUNT = { STARTER: '150', ENTERPRISE: '500' };

const NETWORK_OPTIONS = [
  { value: 'MTN', label: 'MTN Mobile Money' },
  { value: 'TELECEL', label: 'Telecel Cash' },
  { value: 'AIRTELTIGO', label: 'AirtelTigo Money' },
];

function CopyField({ label, value }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success('Copied!');
  };
  return (
    <div className="flex items-center justify-between p-2.5 bg-white dark:bg-background rounded-lg border">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold font-mono text-sm">{value}</p>
      </div>
      <Button size="sm" variant="ghost" type="button" onClick={handleCopy}>
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function StatusCard({ request, onResubmit }) {
  const cfg = {
    PENDING_REVIEW: {
      label: 'Pending Review',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      Icon: Clock,
    },
    APPROVED: {
      label: 'Approved',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
      Icon: CheckCircle2,
    },
    REJECTED: {
      label: 'Rejected',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      Icon: X,
    },
  }[request.status] || {
    label: request.status,
    color: 'text-muted-foreground',
    bg: '',
    Icon: Clock,
  };

  return (
    <Card className={`border ${cfg.bg}`}>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <cfg.Icon className={`h-5 w-5 ${cfg.color}`} />
          <span className={`font-semibold ${cfg.color}`}>Status: {cfg.label}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="font-medium">{request.selectedPlan}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="font-medium">GHS {request.amountPaid}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Submitted</p>
            <p className="font-medium">
              {new Date(request.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Method</p>
            <p className="font-medium">
              {request.paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'Bank Transfer'}
            </p>
          </div>
        </div>
        {request.status === 'REJECTED' && request.rejectionReason && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Rejection reason:</strong> {request.rejectionReason}
            </AlertDescription>
          </Alert>
        )}
        {request.status === 'REJECTED' && onResubmit && (
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={onResubmit}>
            Submit New Payment Request
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function ManualActivationForm() {
  const queryClient = useQueryClient();

  const [plan, setPlan] = useState('STARTER');
  const [amountPaid, setAmountPaid] = useState('150');
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY');
  const [network, setNetwork] = useState('MTN');
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNameUsed, setAccountNameUsed] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [note, setNote] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: requestsData, refetch: refetchRequests } = useQuery({
    queryKey: ['activation-requests'],
    queryFn: () => subscriptionAPI.getActivationRequests(),
    retry: 1,
  });

  const requests = requestsData?.data?.data || requestsData?.data || [];
  const latestRequest = Array.isArray(requests) ? requests[0] : null;
  const hasPending = latestRequest?.status === 'PENDING_REVIEW';

  const handlePlanChange = (val) => {
    setPlan(val);
    setAmountPaid(PLAN_DEFAULT_AMOUNT[val] || '');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const mutation = useMutation({
    mutationFn: (formData) => subscriptionAPI.submitActivationRequestMultipart(formData),
    onSuccess: () => {
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['activation-requests'] });
      refetchRequests();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Failed to submit activation request'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'MOBILE_MONEY') {
      if (!network) return toast.error('Please select a network');
      if (!paymentPhoneNumber) return toast.error('Payment phone number is required');
      if (!transactionId) return toast.error('Transaction ID is required');
      if (!proofFile) return toast.error('Proof of payment is required');
    } else {
      if (!bankName) return toast.error('Bank name is required');
      if (!paymentReference) return toast.error('Reference number is required');
      if (!proofFile) return toast.error('Proof of payment is required');
    }

    const formData = new FormData();
    formData.append('selectedPlan', plan);
    formData.append('amountPaid', amountPaid);
    formData.append('paymentMethod', paymentMethod);
    formData.append('paymentDate', new Date(paymentDate).toISOString());
    if (note) formData.append('note', note);
    if (proofFile) formData.append('proofOfPayment', proofFile);

    if (paymentMethod === 'MOBILE_MONEY') {
      formData.append('network', network);
      formData.append('paymentPhoneNumber', paymentPhoneNumber);
      formData.append('transactionId', transactionId);
      formData.append('paymentReference', transactionId);
    } else {
      formData.append('bankName', bankName);
      if (accountNameUsed) formData.append('accountNameUsed', accountNameUsed);
      formData.append('paymentReference', paymentReference);
    }

    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Latest request status */}
      {latestRequest && !showForm && (
        <>
          {hasPending ? (
            <>
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                <BadgeCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200 space-y-1">
                  <p className="font-semibold">Payment request submitted successfully.</p>
                  <p>Your payment is now pending admin review.</p>
                  <p>
                    ResolveHub will verify and activate your subscription within 1–2 hours.
                  </p>
                </AlertDescription>
              </Alert>
              <StatusCard request={latestRequest} />
            </>
          ) : (
            <StatusCard
              request={latestRequest}
              onResubmit={latestRequest.status === 'REJECTED' ? () => setShowForm(true) : null}
            />
          )}
          {!hasPending && latestRequest.status !== 'REJECTED' && (
            <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
              Submit New Payment Request
            </Button>
          )}
        </>
      )}

      {/* Payment Details */}
      {(!latestRequest || showForm) && (
        <>
          <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-blue-600" />
              Mobile Money Details
            </h3>
            <div className="space-y-2">
              <CopyField label="MTN Mobile Money" value="+233 59 434 5424" />
              <CopyField label="Telecel Cash" value="+233 57 220 7831" />
              <CopyField label="Account Name" value="Samson Egbetorke Or Lydia Myers" />
            </div>
            <div className="h-px bg-border" />
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Banknote className="h-4 w-4 text-indigo-600" />
              Bank Transfer Details
            </h3>
            <div className="space-y-2">
              <CopyField label="Bank Name" value="GT Bank Ghana" />
              <CopyField label="Account Number" value="12140001021994" />
              <CopyField label="Account Name" value="Samson Yao Egbetorke" />
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Request Activation</CardTitle>
              <CardDescription>
                After making payment, fill this form to request subscription activation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Plan + Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Plan</label>
                    <select
                      value={plan}
                      onChange={(e) => handlePlanChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      required
                    >
                      {PLAN_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label} — {p.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Amount Paid (GHS)</label>
                    <Input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="150.00"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Method + Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      required
                    >
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">
                      <Calendar className="inline h-3.5 w-3.5 mr-1" />
                      Payment Date
                    </label>
                    <Input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                {/* Mobile Money fields */}
                {paymentMethod === 'MOBILE_MONEY' && (
                  <>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Network</label>
                      <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                        required
                      >
                        {NETWORK_OPTIONS.map((n) => (
                          <option key={n.value} value={n.value}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        <Phone className="inline h-3.5 w-3.5 mr-1" />
                        Payment Phone Number
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={paymentPhoneNumber}
                        onChange={(e) => setPaymentPhoneNumber(e.target.value)}
                        placeholder="e.g., 0244123456"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        <Hash className="inline h-3.5 w-3.5 mr-1" />
                        Transaction ID
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g., 2306789012345"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Bank Transfer fields */}
                {paymentMethod === 'BANK_TRANSFER' && (
                  <>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        <Building2 className="inline h-3.5 w-3.5 mr-1" />
                        Bank Name
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g., Zenith Bank Ghana"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        Account Name Used
                      </label>
                      <Input
                        type="text"
                        value={accountNameUsed}
                        onChange={(e) => setAccountNameUsed(e.target.value)}
                        placeholder="Name on the sending account"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        <Hash className="inline h-3.5 w-3.5 mr-1" />
                        Reference Number
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Bank transfer reference number"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Proof of Payment */}
                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    <Upload className="inline h-3.5 w-3.5 mr-1" />
                    Proof of Payment
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="border-2 border-dashed border-input rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                    {proofPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={proofPreview}
                          alt="Proof preview"
                          className="max-h-40 mx-auto rounded-lg object-contain"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2"
                          onClick={() => { setProofFile(null); setProofPreview(null); }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : proofFile ? (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span>{proofFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setProofFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload screenshot or PDF
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, PDF up to 10MB
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,image/jpg,application/pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any additional information about your payment"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
                  />
                </div>

                <Button type="submit" disabled={mutation.isPending} className="w-full">
                  {mutation.isPending ? 'Submitting...' : 'Submit Activation Request'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Our team will verify your payment within 1–2 hours and activate your account.
                </p>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

