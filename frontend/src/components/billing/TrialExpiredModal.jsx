import { AlertTriangle, Mail, MessageCircle, Phone, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TrialExpiredModal - Shows when trial has expired and user tries to access protected features.
 * Offers contact options and prevents access to main dashboard.
 */
const TrialExpiredModal = ({ subscription, onClose, isOpen = true }) => {
  const [isLoadingWhatsApp, setIsLoadingWhatsApp] = useState(false);
  const [isLoadingPhone, setIsLoadingPhone] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const navigate = useNavigate();

  if (!isOpen || !subscription || subscription.status !== 'EXPIRED') {
    return null;
  }

  const supportEmail = 'support@resolvehub.com';
  const supportPhone = '+233 (0) XXX XXX XXX'; // Update with actual number
  const supportWhatsApp = '+233XXXXXXXXX'; // Update with actual WhatsApp number

  const handleContactEmail = () => {
    setIsLoadingEmail(true);
    window.location.href = `mailto:${supportEmail}?subject=Request%20Account%20Activation&body=Hello%2C%20I%20would%20like%20to%20activate%20my%20account.`;
    setTimeout(() => setIsLoadingEmail(false), 1000);
  };

  const handleContactPhone = () => {
    setIsLoadingPhone(true);
    window.location.href = `tel:${supportPhone}`;
    setTimeout(() => setIsLoadingPhone(false), 1000);
  };

  const handleContactWhatsApp = () => {
    setIsLoadingWhatsApp(true);
    const message = encodeURIComponent(
      'Hello, I would like to activate my ResolveHub account after my free trial expired.'
    );
    window.open(`https://wa.me/${supportWhatsApp.replace(/\D/g, '')}?text=${message}`, '_blank');
    setTimeout(() => setIsLoadingWhatsApp(false), 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border-b border-red-200 dark:border-red-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Trial Expired
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded text-red-600 dark:text-red-400"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              Your 14-day free trial has ended. To continue using ResolveHub and access your
              dashboard, please contact our support team to activate your account.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Contact ResolveHub Support:
            </p>

            {/* Email Contact */}
            <Button
              onClick={handleContactEmail}
              disabled={isLoadingEmail}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Mail className="w-4 h-4" />
              {isLoadingEmail ? 'Opening...' : 'Email Support'}
            </Button>

            {/* Phone Contact */}
            <Button
              onClick={handleContactPhone}
              disabled={isLoadingPhone}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Phone className="w-4 h-4" />
              {isLoadingPhone ? 'Calling...' : 'Call Support'}
            </Button>

            {/* WhatsApp Contact */}
            <Button
              onClick={handleContactWhatsApp}
              disabled={isLoadingWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              <MessageCircle className="w-4 h-4" />
              {isLoadingWhatsApp ? 'Opening...' : 'WhatsApp Support'}
            </Button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>✓ Contact ResolveHub support with one of the options above</li>
              <li>✓ Our team will verify your information</li>
              <li>✓ Your account will be activated</li>
              <li>✓ You'll regain full dashboard access</li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> Your company data is safe and will not be deleted. Once your
              account is activated, all your complaints and data will be accessible.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Billing information is managed on a separate page
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiredModal;
