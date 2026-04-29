import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle, Copy, Home } from 'lucide-react';
import { useState } from 'react';

export default function ComplaintSuccess() {
  const [searchParams] = useSearchParams();
  const refNumber = searchParams.get('ref') || '';
  const [copied, setCopied] = useState(false);

  const copyRef = () => {
    if (refNumber) {
      navigator.clipboard.writeText(refNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-muted-foreground mb-6">
            Your feedback has been submitted successfully. Our team will review it and take appropriate action.
          </p>

          {refNumber && (
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-lg font-mono font-bold">{refNumber}</code>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyRef}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
              <p className="text-xs text-muted-foreground mt-2">
                Save this reference number to track the status of your complaint.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you provided your email, you'll receive updates on your complaint status.
            </p>
            <Link to="/">
              <Button variant="outline" className="mt-2">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            Powered by <span className="font-semibold">ResolveHub</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
