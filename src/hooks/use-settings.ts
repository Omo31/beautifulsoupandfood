

'use client';

import { useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/utils';
import type { LgaShippingZone } from '@/lib/shipping';
import { useToast } from './use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type AppSettings = {
    homepage: {
        heroTitle: string;
        heroSubtitle: string;
        heroImageId: string;
        videoTitle: string;
        videoId: string;
        videoDescription: string;
        aboutTitle: string;
        aboutDescription1: string;
        aboutDescription2: string;
        aboutImageId: string;
    };
    footer: {
        socialLinks: {
            facebook: string;
            instagram: string;
            twitter: string;
        };
        legalLinks: {
            terms: string;
            privacy: string;
        };
        openingHours: string;
    };
    shipping: {
        lagosLgas: LgaShippingZone[];
    };
    customOrder: {
        measures: string[];
        services: string[];
    };
    store: {
        monthlyRevenueGoal: number;
    }
};

export function useSettings() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const settingsDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        // All settings are stored in a single document called 'app'
        return doc(firestore, 'settings', 'app');
    }, [firestore]);

    const { data: settings, loading, error } = useDoc<AppSettings>(settingsDocRef);

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        if (!settingsDocRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'Firestore not initialized.' });
            return;
        }

        try {
            await setDoc(settingsDocRef, newSettings, { merge: true });
            toast({ title: 'Settings Saved', description: 'Your changes have been saved successfully.' });
        } catch (serverError: any) {
            const permissionError = new FirestorePermissionError({
                path: settingsDocRef.path,
                operation: 'update',
                requestResourceData: newSettings
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'You do not have permission to save settings.' });
        }
    };

    return {
        settings,
        loading,
        error,
        updateSettings,
    };
}
