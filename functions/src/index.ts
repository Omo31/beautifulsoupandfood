/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall} from "firebase-functions/v2/https";
import {log} from "firebase-functions/logger";
import { auth } from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
/**
 * This Cloud Function is triggered whenever a new user is created in Firebase Authentication.
 * It checks if the new user's email matches the designated owner's email address.
 * If it matches, it sets a custom user claim `role: 'Owner'`, granting them
 * full administrative privileges as defined in the Firestore Security Rules.
 */
exports.setOwnerRoleOnCreate = auth.user().onCreate(async (user) => {
    // This is the designated owner's email address.
    // All other users will be assigned the default "Customer" role.
    const ownerEmail = "oluwagbengwumi@gmail.com";

    if (user.email && user.email === ownerEmail) {
        try {
            await admin.auth().setCustomUserClaims(user.uid, { role: 'Owner' });
            log(`Successfully set 'Owner' role for user: ${user.email}`);
        } catch (error) {
            log(`Error setting custom claim for ${user.email}:`, error);
        }
    }
});
