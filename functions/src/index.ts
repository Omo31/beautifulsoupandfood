
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { log } from "firebase-functions/logger";
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


/**
 * A callable Cloud Function to allow an 'Owner' to set the role of another user.
 */
export const setUserRole = onCall(async (request) => {
    // 1. Authentication and Authorization Check
    // Check if the user making the request is authenticated and has the 'Owner' role.
    if (request.auth?.token.role !== 'Owner') {
        throw new HttpsError('permission-denied', 'You must be an Owner to perform this action.');
    }

    const { userId, newRole } = request.data;

    // 2. Data Validation
    if (!userId || !newRole) {
        throw new HttpsError('invalid-argument', 'The function must be called with "userId" and "newRole" arguments.');
    }
    const allowedRoles = ['Owner', 'Content Manager', 'Customer'];
    if (!allowedRoles.includes(newRole)) {
         throw new HttpsError('invalid-argument', `Invalid role. Must be one of: ${allowedRoles.join(', ')}.`);
    }

    try {
        // 3. Set the custom claim on the target user
        await admin.auth().setCustomUserClaims(userId, { role: newRole });
        log(`Successfully set role '${newRole}' for user ${userId} by ${request.auth.uid}`);
        return { success: true, message: `Role '${newRole}' has been set for user ${userId}.` };
    } catch (error) {
        log('Error setting custom claims:', error);
        throw new HttpsError('internal', 'An error occurred while setting the user role.');
    }
});


/**
 * A callable Cloud Function to allow an 'Owner' to disable or enable another user's account.
 */
export const toggleUserStatus = onCall(async (request) => {
    // 1. Authentication and Authorization Check
    if (request.auth?.token.role !== 'Owner') {
        throw new HttpsError('permission-denied', 'You must be an Owner to perform this action.');
    }

    const { userId, disabled } = request.data;

    // 2. Data Validation
    if (!userId || typeof disabled !== 'boolean') {
        throw new HttpsError('invalid-argument', 'The function must be called with "userId" and a boolean "disabled" status.');
    }
    
    if (request.auth.uid === userId) {
        throw new HttpsError('invalid-argument', 'You cannot disable your own account.');
    }

    try {
        // 3. Update the user's disabled status in Firebase Auth
        await admin.auth().updateUser(userId, { disabled: disabled });
        const status = disabled ? 'disabled' : 'enabled';
        log(`Successfully ${status} user ${userId} by ${request.auth.uid}`);
        return { success: true, message: `User account has been ${status}.` };
    } catch (error) {
        log('Error updating user status:', error);
        throw new HttpsError('internal', 'An error occurred while updating the user status.');
    }
});
