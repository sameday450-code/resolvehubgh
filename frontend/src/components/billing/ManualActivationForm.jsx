import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { Calendar, Copy, DollarSign, MessageSquare, Smartphone, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export default function ManualActivationForm() {
  const queryClient = useQueryClient();
  const [plan, setPlan] = useState('STARTER');
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState('150');
  const [note, setNote] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => subscriptionAPI.submitActivationRequest(data),
    onSuccess: () => {
      toast.success('Activation request sent. ResolveHub will verify your payment and activate your account.');
      setOpen(false);
      // Reset form
      setPlan('STARTER');
      setPaymentMethod('MOBILE_MONEY');
      setPaymentReference('');
      setAmountPaid('150');
      setNote('');
      setProofFile(null);
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit activation request'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      selectedPlan: plan,
      amountPaid: parseFloat(amountPaid),
      paymentMethod,
      paymentReference,
      paymentDate: new Date(paymentDate).toISOString(),
      note,
    };

    // TODO: Handle file upload if file is selected
    // For now, we'll just send without proof of payment

    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Payment Instructions */}
      <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Mobile Money Payment</h3>
            <p className="text-xs text-muted-foreground mt-1">Send payment to the numbers below</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-card rounded-lg border">
                <div>
                  <p className="text-xs text-muted-foreground">MTN Mobile Money</p>
                  <p className="font-mono font-semibold">+233 20 123 4567</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText('+233 20 123 4567');
                    toast.success('Copied!');
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-card rounded-lg border">
                <div>
                  <p className="text-xs text-muted-foreground">Account Name</p>
                  <p className="font-semibold">ResolveHub GH</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText('ResolveHub GH');
                    toast.success('Copied!');
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Bank Transfer</h3>
            <p className="text-xs text-muted-foreground mt-1">Send payment via bank transfer</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="p-2.5 bg-white dark:bg-card rounded-lg border space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Bank Name</p>
                  <p className="font-semibold">Zenith Bank Ghana</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Account Number</p>
                  <p className="font-mono font-semibold">1234567890</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Account Name</p>
                  <p className="font-semibold">ResolveHub Limited</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp: <strong>+233 20 987 6543</strong></span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Email: <strong>support@resolvehub.com</strong></span>
          </div>
        </div>
      </div>

      {/* Activation Request Form */}
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-semibold mb-4">Request Activation</h3>
        <p className="text-sm text-muted-foreground mb-5">
          After making payment via Mobile Money or Bank Transfer, fill out this form to request activation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="STARTER">Starter - GHS 150/month</option>
                <option value="ENTERPRISE">Enterprise - GHS 500/month</option>
                <option value="CUSTOM">Custom Plan</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Amount Paid (GHS)</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="150.00"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Payment Reference</label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g., MoMo transaction ID or bank reference"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Additional Notes (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional information about your payment"
              rows="3"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
            />
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full rounded-lg">
            {mutation.isPending ? 'Sending...' : 'Submit Activation Request'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Our team will verify your payment within 1-2 hours and activate your account.
          </p>
        </form>
      </div>
    </div>
  );
}
