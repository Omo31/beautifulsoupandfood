'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a client-side component that listens for permission errors
// and throws them as uncaught exceptions. This is what allows the
// Next.js development error overlay to pick them up.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // In a production environment, you might log this to a service
      // like Sentry or LogRocket instead of throwing.
      if (process.env.NODE_ENV === 'development') {
        // This makes the error show up in the Next.js overlay
        setTimeout(() => {
          throw error;
        }, 0);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component does not render anything
  return null;
}
