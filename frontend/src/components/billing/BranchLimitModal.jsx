import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Loader2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import toast from 'react-hot-toast';
import { paymentsAPI } from '../../lib/api';

export default function BranchLimitModal({ isOpen, onClose, plan, planLimit, onPaymentComplete, companyId }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [paymentReference, setPaymentReference] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const branchPrice = 600;

  const getModalContent = () => {
    switch (plan) {
      case 'STARTER':
        return {
          title: 'Branch Limit Reached',
          message: 'Your Starter Plan includes only 1 branch.',
          details: 'To add another branch, an additional payment of GHS 600 is required.',
        };
      case 'PRO':
        return {
          title: 'Branch Limit Reached',
          message: 'Your Pro Plan includes a maximum of 4 branches.',
          details: 'Additional branches require a payment of GHS 600 per branch.',
        };
      default:
        return {
          title: 'Branch Limit Reached',
          message: `Your plan allows only ${planLimit} branch${planLimit !== 1 ? 'es' : ''}.`,
          details: 'Additional branches require a payment of GHS 600 per branch.',
        };
    }
  };

  const content = getModalContent();

  const handleProceedWithPayment = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentReference.trim()) {
      toast.error('Please enter a payment reference');
      return;
    }

    setIsProcessing(true);
    try {
      // Call the payment API
      const response = await paymentsAPI.submitBranchUpgradePayment({
        amount: branchPrice,
        paymentMethod,
        paymentReference,
        branches: 1, // Adding 1 branch at a time
      });

      toast.success('Payment submitted successfully! Your branch limit will be updated within 2 hours.');
      if (onPaymentComplete) {
        onPaymentComplete(response.data);
      }
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to process payment';
      toast.error(errorMsg);
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{content.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Plan Info */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">{content.message}</p>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">{content.details}</p>
          </div>

          {/* Pricing Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Additional Branch Cost</p>
                <p className="text-xs text-blue-800 dark:text-blue-200 mt-0.5">One-time payment</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">GHS {branchPrice}</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          {showPaymentForm ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                  Payment Method
                </Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Money</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank Transfer</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="reference" className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                  Payment Reference/Transaction ID
                </Label>
                <Input
                  id="reference"
                  placeholder="Enter your transaction ID"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  disabled={isProcessing}
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          {!showPaymentForm ? (
            <Button
              onClick={handleProceedWithPayment}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <span>Pay GHS {branchPrice}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePaymentSubmit}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span>Submit Payment</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Help text */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            After payment, our team will verify and activate your additional branch within 2 hours. Questions? Email resolvehub3@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
