import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const LOADING_MESSAGES = [
  'Preparing your dashboard...',
  'Loading your workspace...',
  'Syncing your data...',
  'Almost there...',
];

const SPLASH_DURATION = 3000;

function getRedirectPath(role) {
  return role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard';
}

export default function PostLoginSplashScreen() {
  const { user, justLoggedIn, setJustLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const messageRef = useRef(null);

  useEffect(() => {
    // If not a fresh login (direct nav or page refresh), skip splash
    if (!justLoggedIn) {
      navigate(getRedirectPath(user?.role), { replace: true });
      return;
    }

    // Consume the flag immediately so back-navigation never replays it
    setJustLoggedIn(false);

    // Cycle loading messages every 900ms
    messageRef.current = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 900);

    // Smooth progress bar
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / SPLASH_DURATION) * 100, 100));
    }, 30);

    // After SPLASH_DURATION begin fade-out
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
      clearInterval(messageRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect after exit animation completes
  const handleExitComplete = () => {
    navigate(getRedirectPath(user?.role), { replace: true });
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, #0f2044 0%, #060d1f 55%, #000000 100%)',
          }}
        >
          {/* Ambient glow rings */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 480,
              height: 480,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 280,
              height: 280,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)',
            }}
          />

          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative flex flex-col items-center gap-6 px-8 py-10 w-full max-w-xs sm:max-w-sm"
          >
            {/* Video / Logo */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white/5 shadow-2xl">
              {!videoError ? (
                <video
                  src="/animated-logo.mp4"
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onError={() => setVideoError(true)}
                />
              ) : (
                <img
                  src="/logo.png"
                  alt="ResolveHub"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                />
              )}

              {/* Subtle inner glow border */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
            </div>

            {/* Brand name */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                ResolveHub
              </p>
              <p className="text-xs sm:text-sm text-white/45 mt-1 tracking-wide">
                Customer Feedback Platform
              </p>
            </motion.div>

            {/* Loading message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="h-5 flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="text-xs sm:text-sm text-white/55 text-center"
                >
                  {LOADING_MESSAGES[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.65 }}
              className="w-full max-w-[220px]"
            >
              <div className="w-full h-[3px] rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background:
                      'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                    boxShadow: '0 0 8px rgba(99,102,241,0.7)',
                    transition: 'width 0.05s linear',
                  }}
                />
              </div>
            </motion.div>

            {/* Spinner dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="flex items-center gap-1.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full bg-blue-400/60"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.22,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Bottom tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute bottom-8 text-xs text-white/20 tracking-wider"
          >
            RESOLVEHUB &mdash; TURN FEEDBACK INTO ACTION
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
