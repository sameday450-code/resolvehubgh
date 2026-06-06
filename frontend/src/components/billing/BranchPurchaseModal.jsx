import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { branchOrderAPI } from '../../lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Textarea } from '../../components/ui/textarea';
import { AlertCircle, Check, Upload, Plus, X } from 'lucide-react';

const COST_PER_BRANCH = 50;

export default function BranchPurchaseModal({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('quantity'); // quantity, branches, payment, review
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Branch details
  const [branches, setBranches] = useState(
    Array(quantity).fill(null).map((_, i) => ({
      id: i,
      name: '',
      address: '',
      city: '',
      region: '',
      country: 'Ghana',
      contactPhone: '',
      contactEmail: '',
      managerName: '',
    }))
  );

  // Mobile Money Payment
  const [mobileMoneyData, setMobileMoneyData] = useState({
    network: 'MTN',
    phoneNumber: '',
    mobileMoneyTxnId: '',
  });

  // Bank Transfer Payment
  const [bankTransferData, setBankTransferData] = useState({
    bankName: '',
    accountNameUsed: '',
    bankTxnReference: '',
  });

  const [notes, setNotes] = useState('');

  const totalCost = quantity * COST_PER_BRANCH;

  const createOrderMutation = useMutation({
    mutationFn: (data) => branchOrderAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['branch-orders']);
      handleClose();
    },
    onError: (error) => {
      setFormError(error.response?.data?.message || 'Failed to submit order');
    },
  });

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
    const newBranches = Array(newQuantity)
      .fill(null)
      .map((_, i) => branches[i] || {
        id: i,
        name: '',
        address: '',
        city: '',
        region: '',
        country: 'Ghana',
        contactPhone: '',
        contactEmail: '',
        managerName: '',
      });
    setBranches(newBranches);
    setFormError('');
  };

  const handleBranchChange = (index, field, value) => {
    const updated = [...branches];
    updated[index][field] = value;
    setBranches(updated);
  };

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate
    if (!proofFile) {
      setFormError('Please upload proof of payment');
      return;
    }

    // Validate branches
    for (const branch of branches) {
      if (!branch.name.trim()) {
        setFormError('All branch names are required');
        return;
      }
    }

    // Validate payment details
    if (paymentMethod === 'MOBILE_MONEY') {
      if (!mobileMoneyData.phoneNumber || !mobileMoneyData.mobileMoneyTxnId) {
        setFormError('Please provide mobile money details');
        return;
      }
    } else if (paymentMethod === 'BANK_TRANSFER') {
      if (!bankTransferData.bankName || !bankTransferData.bankTxnReference) {
        setFormError('Please provide bank transfer details');
        return;
      }
    }

    setLoading(true);

    try {
      // Upload proof file first
      const formData = new FormData();
      formData.append('file', proofFile);
      const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload proof');
      const { url: proofUrl } = await uploadResponse.json();

      // Submit order
      await createOrderMutation.mutateAsync({
        quantity,
        paymentMethod,
        branches: branches.map(b => ({
          name: b.name,
          address: b.address || undefined,
          city: b.city || undefined,
          region: b.region || undefined,
          country: b.country || 'Ghana',
          contactPhone: b.contactPhone || undefined,
          contactEmail: b.contactEmail || undefined,
          managerName: b.managerName || undefined,
        })),
        paymentDetails: {
          network: paymentMethod === 'MOBILE_MONEY' ? mobileMoneyData.network : undefined,
          phoneNumber: paymentMethod === 'MOBILE_MONEY' ? mobileMoneyData.phoneNumber : undefined,
          mobileMoneyTxnId: paymentMethod === 'MOBILE_MONEY' ? mobileMoneyData.mobileMoneyTxnId : undefined,
          bankName: paymentMethod === 'BANK_TRANSFER' ? bankTransferData.bankName : undefined,
          accountNameUsed: paymentMethod === 'BANK_TRANSFER' ? bankTransferData.accountNameUsed : undefined,
          bankTxnReference: paymentMethod === 'BANK_TRANSFER' ? bankTransferData.bankTxnReference : undefined,
          transactionReference: paymentMethod === 'MOBILE_MONEY' 
            ? mobileMoneyData.mobileMoneyTxnId 
            : bankTransferData.bankTxnReference,
          proofOfPaymentUrl: proofUrl,
          paymentDate,
          note: notes,
        },
      });
    } catch (error) {
      setFormError(error.message || 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('quantity');
    setQuantity(1);
    setPaymentMethod('MOBILE_MONEY');
    setFormError('');
    setProofFile(null);
    setProofPreview('');
    setBranches([{
      id: 0,
      name: '',
      address: '',
      city: '',
      region: '',
      country: 'Ghana',
      contactPhone: '',
      contactEmail: '',
      managerName: '',
    }]);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Branches</DialogTitle>
          <DialogDescription>
            Select the number of branches and provide payment details
          </DialogDescription>
        </DialogHeader>

        <Tabs value={step} onValueChange={setStep} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quantity">Quantity</TabsTrigger>
            <TabsTrigger value="branches" disabled={step === 'quantity'}>
              Details
            </TabsTrigger>
            <TabsTrigger value="payment" disabled={!['branches', 'payment', 'review'].includes(step)}>
              Payment
            </TabsTrigger>
            <TabsTrigger value="review" disabled={!['payment', 'review'].includes(step)}>
              Review
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Quantity Selection */}
          <TabsContent value="quantity" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="quantity">Number of Branches</Label>
                <p className="text-sm text-gray-500 mb-2">
                  How many branches do you want to add?
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                  >
                    −
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 text-center text-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(Math.min(100, quantity + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Cost Breakdown */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cost per branch:</span>
                    <span className="font-semibold">{COST_PER_BRANCH} GHS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of branches:</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 flex justify-between text-lg">
                    <span className="font-bold">Total Cost:</span>
                    <span className="font-bold text-blue-700">{totalCost} GHS</span>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => setStep('branches')}
                className="w-full"
              >
                Continue to Branch Details
              </Button>
            </div>
          </TabsContent>

          {/* Step 2: Branch Details */}
          <TabsContent value="branches" className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter details for each of the {quantity} branches
            </p>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {branches.map((branch, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">Branch {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`name-${index}`}>Branch Name *</Label>
                        <Input
                          id={`name-${index}`}
                          value={branch.name}
                          onChange={(e) => handleBranchChange(index, 'name', e.target.value)}
                          placeholder="e.g., Main Office"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`code-${index}`}>Manager Name</Label>
                        <Input
                          id={`code-${index}`}
                          value={branch.managerName}
                          onChange={(e) => handleBranchChange(index, 'managerName', e.target.value)}
                          placeholder="Manager name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`address-${index}`}>Address</Label>
                      <Input
                        id={`address-${index}`}
                        value={branch.address}
                        onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                        placeholder="Street address"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`city-${index}`}>City</Label>
                        <Input
                          id={`city-${index}`}
                          value={branch.city}
                          onChange={(e) => handleBranchChange(index, 'city', e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`region-${index}`}>Region</Label>
                        <Input
                          id={`region-${index}`}
                          value={branch.region}
                          onChange={(e) => handleBranchChange(index, 'region', e.target.value)}
                          placeholder="Region"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`country-${index}`}>Country</Label>
                        <Input
                          id={`country-${index}`}
                          value={branch.country}
                          onChange={(e) => handleBranchChange(index, 'country', e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`phone-${index}`}>Contact Phone</Label>
                        <Input
                          id={`phone-${index}`}
                          type="tel"
                          value={branch.contactPhone}
                          onChange={(e) => handleBranchChange(index, 'contactPhone', e.target.value)}
                          placeholder="Contact number"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${index}`}>Contact Email</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={branch.contactEmail}
                          onChange={(e) => handleBranchChange(index, 'contactEmail', e.target.value)}
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('quantity')}>
                Back
              </Button>
              <Button onClick={() => setStep('payment')} className="flex-1">
                Continue to Payment
              </Button>
            </div>
          </TabsContent>

          {/* Step 3: Payment Details */}
          <TabsContent value="payment" className="space-y-4">
            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div>
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    type="button"
                    variant={paymentMethod === 'MOBILE_MONEY' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('MOBILE_MONEY')}
                  >
                    Mobile Money
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'BANK_TRANSFER' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  >
                    Bank Transfer
                  </Button>
                </div>
              </div>

              {/* Mobile Money Fields */}
              {paymentMethod === 'MOBILE_MONEY' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded">
                  <div>
                    <Label htmlFor="network">Network</Label>
                    <select
                      id="network"
                      value={mobileMoneyData.network}
                      onChange={(e) =>
                        setMobileMoneyData({ ...mobileMoneyData, network: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="MTN">MTN</option>
                      <option value="TELECEL">Telecel</option>
                      <option value="AIRTELTIGO">AirtelTigo</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={mobileMoneyData.phoneNumber}
                      onChange={(e) =>
                        setMobileMoneyData({ ...mobileMoneyData, phoneNumber: e.target.value })
                      }
                      placeholder="024XXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="txnId">Transaction ID</Label>
                    <Input
                      id="txnId"
                      value={mobileMoneyData.mobileMoneyTxnId}
                      onChange={(e) =>
                        setMobileMoneyData({
                          ...mobileMoneyData,
                          mobileMoneyTxnId: e.target.value,
                        })
                      }
                      placeholder="XXXXXXXXXX"
                    />
                  </div>
                </div>
              )}

              {/* Bank Transfer Fields */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded">
                  <div>
                    <Label htmlFor="bank">Bank Name</Label>
                    <Input
                      id="bank"
                      value={bankTransferData.bankName}
                      onChange={(e) =>
                        setBankTransferData({ ...bankTransferData, bankName: e.target.value })
                      }
                      placeholder="e.g., GCB Bank"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountName">Account Name Used</Label>
                    <Input
                      id="accountName"
                      value={bankTransferData.accountNameUsed}
                      onChange={(e) =>
                        setBankTransferData({
                          ...bankTransferData,
                          accountNameUsed: e.target.value,
                        })
                      }
                      placeholder="Account name from bank"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">Transaction Reference / Check #</Label>
                    <Input
                      id="reference"
                      value={bankTransferData.bankTxnReference}
                      onChange={(e) =>
                        setBankTransferData({
                          ...bankTransferData,
                          bankTxnReference: e.target.value,
                        })
                      }
                      placeholder="Reference or check number"
                    />
                  </div>
                </div>
              )}

              {/* Payment Date */}
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              {/* Proof Upload */}
              <div className="space-y-2">
                <Label htmlFor="proof">Proof of Payment *</Label>
                <p className="text-xs text-gray-500">
                  Upload receipt, screenshot, or confirmation of payment
                </p>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    <span>Choose file</span>
                    <input
                      id="proof"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleProofUpload}
                      className="hidden"
                    />
                  </label>
                  {proofFile && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded border border-green-200">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{proofFile.name}</span>
                    </div>
                  )}
                </div>
                {proofPreview && (
                  <div className="relative w-full h-32 bg-gray-100 rounded overflow-hidden">
                    {proofFile?.type.startsWith('image/') ? (
                      <img src={proofPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        PDF Preview
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>

              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('branches')}>
                  Back
                </Button>
                <Button onClick={() => setStep('review')} className="flex-1">
                  Review Order
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Step 4: Review */}
          <TabsContent value="review" className="space-y-4">
            <div className="space-y-4">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Branches:</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per branch:</span>
                    <span className="font-semibold">{COST_PER_BRANCH} GHS</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg">
                    <span className="font-bold">Total Amount:</span>
                    <span className="font-bold text-blue-700">{totalCost} GHS</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Method:</strong> {paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'Bank Transfer'}</div>
                  {paymentMethod === 'MOBILE_MONEY' ? (
                    <>
                      <div><strong>Network:</strong> {mobileMoneyData.network}</div>
                      <div><strong>Phone:</strong> {mobileMoneyData.phoneNumber}</div>
                      <div><strong>Transaction ID:</strong> {mobileMoneyData.mobileMoneyTxnId}</div>
                    </>
                  ) : (
                    <>
                      <div><strong>Bank:</strong> {bankTransferData.bankName}</div>
                      <div><strong>Reference:</strong> {bankTransferData.bankTxnReference}</div>
                    </>
                  )}
                  <div><strong>Payment Date:</strong> {paymentDate}</div>
                </CardContent>
              </Card>

              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  By submitting this order, you confirm that payment has been completed and the proof
                  of payment is attached. Pending approval from our team.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('payment')} disabled={loading}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Order'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
