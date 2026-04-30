import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

/**
 * TrialSupportContact - Shows support contact options for trial-expired accounts.
 * Used on billing page or in restricted dashboard access scenario.
 */
const TrialSupportContact = ({ isExpired = false, isDarkMode = false }) => {
  const supportEmail = 'support@resolvehub.com';
  const supportPhone = '+233 (0) XXX XXX XXX'; // Update with actual number
  const supportWhatsApp = '+233XXXXXXXXX'; // Update with actual WhatsApp number

  const handleContactEmail = () => {
    window.location.href = `mailto:${supportEmail}?subject=Request%20Account%20Activation&body=Hello%2C%20I%20would%20like%20to%20activate%20my%20account.`;
  };

  const handleContactPhone = () => {
    window.location.href = `tel:${supportPhone}`;
  };

  const handleContactWhatsApp = () => {
    const message = encodeURIComponent(
      'Hello, I would like to activate my ResolveHub account.'
    );
    window.open(`https://wa.me/${supportWhatsApp.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <Card className={isExpired ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30' : ''}>
      <CardHeader>
        <CardTitle>{isExpired ? 'Account Activation' : 'Contact Support'}</CardTitle>
        <CardDescription>
          {isExpired
            ? 'Your trial has ended. Contact ResolveHub to activate your account.'
            : 'Need help with your subscription?'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isExpired && (
          <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              Your ResolveHub account trial has expired. To continue using the platform and
              maintain access to your company's complaint data, please contact our support team.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {/* Email Contact */}
          <Button
            onClick={handleContactEmail}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Mail className="w-4 h-4" />
            Email: {supportEmail}
          </Button>

          {/* Phone Contact */}
          <Button
            onClick={handleContactPhone}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Phone className="w-4 h-4" />
            Call: {supportPhone}
          </Button>

          {/* WhatsApp Contact */}
          <Button
            onClick={handleContactWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            size="sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
        </div>

        {!isExpired && (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
            <p className="font-semibold mb-2">Typical Response Time:</p>
            <ul className="space-y-1">
              <li>• Email: Within 24 hours</li>
              <li>• Phone: During business hours</li>
              <li>• WhatsApp: Within 1 hour</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrialSupportContact;
