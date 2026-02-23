'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function ConditionalAnalytics() {
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if user has consented to analytics cookies
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem('covialvi_cookie_consent');
        if (consent) {
          const preferences = JSON.parse(consent);
          setAnalyticsConsent(preferences.analytics === true);
        }
      } catch (error) {
        console.error('Error reading cookie consent:', error);
      }
    };

    checkConsent();

    // Listen for consent changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'covialvi_cookie_consent') {
        checkConsent();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when consent is updated on same page
    const handleConsentUpdate = () => checkConsent();
    window.addEventListener('cookieConsentUpdated', handleConsentUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
    };
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <>
      {analyticsConsent && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
