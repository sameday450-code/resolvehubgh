import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

export default function InvalidQR() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Invalid QR Code</h1>
          <p className="text-muted-foreground mb-6">
            This QR code is either invalid, expired, or has been disabled. Please check the QR code and try again, or contact the business directly.
          </p>

          <div className="space-y-3">
            <Link to="/">
              <Button>
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
