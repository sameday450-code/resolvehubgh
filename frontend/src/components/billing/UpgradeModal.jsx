import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  RadioGroup,
  RadioGroupItem,
} from '../ui/radio-group';
import {
  AlertCircle,
  Loader,
  ExternalLink,
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export default function UpgradeModal({
  isOpen,
  onClose,
  subscription,
  plans = [],
  isLoading = false,
  onSelectGateway,
}) {
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    if (!selectedGateway) return;

    setIsProcessing(true);
    try {
      await onSelectGateway(selectedGateway);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get current plan vs upgrade options
  const currentPlan = subscription?.subscriptionPlan;
  const upgradeOptions = plans.filter(
    (p) => !currentPlan || p.price > currentPlan.price
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose Payment Method</DialogTitle>
          <DialogDescription>
            Select your preferred payment gateway to proceed with checkout
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Gateway Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Payment Gateway</label>

            <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway}>
              {/* Paystack Option */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <RadioGroupItem value="PAYSTACK" id="paystack" />
                <label
                  htmlFor="paystack"
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">🟢 Paystack</span>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fast, secure payment via Paystack. Supports GHS, NGN, and more.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ✓ Instant payment processing
                  </p>
                </label>
              </div>

              {/* Stripe Option */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <RadioGroupItem value="STRIPE" id="stripe" />
                <label htmlFor="stripe" className="flex-1 cursor-pointer space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">🔵 Stripe</span>
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
                      International
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Global payments accepted. Works with credit cards worldwide.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ✓ Secure PCI-compliant checkout
                  </p>
                </label>
              </div>

              {/* Contact Sales Option */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <RadioGroupItem value="CONTACT_SALES" id="contact" />
                <label
                  htmlFor="contact"
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <span className="font-semibold">💬 Contact Sales</span>
                  <p className="text-sm text-muted-foreground">
                    For enterprise or custom billing arrangements.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ✓ Personalized support
                  </p>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Plan Summary */}
          {currentPlan && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Plan Details</p>
              <div className="bg-muted/40 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Plan</span>
                  <span className="font-semibold">{currentPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">
                    ₵{currentPlan.price.toFixed(2)}/
                    {currentPlan.billingCycle.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold capitalize">
                    {subscription.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              You'll be redirected to complete payment securely. Your subscription
              will activate immediately after successful payment.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="space-y-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>

          {selectedGateway === 'CONTACT_SALES' ? (
            <Button
              onClick={() => {
                window.open('/contact?type=sales', '_blank');
                onClose();
              }}
              className="gap-2"
            >
              Contact Sales <ExternalLink className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleUpgrade}
              disabled={!selectedGateway || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Payment
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
