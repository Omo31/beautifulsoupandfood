
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
import { auth, eventarc } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { subMonths, format, eachDayOfInterval, isSameDay } from 'date-fns';
import * as cors from 'cors';

const corsHandler = cors({ origin: true });

admin.initializeApp();

const OWNER_EMAIL = "oluwagbengwumi@gmail.com";

const setOwnerClaim = async (user: admin.auth.UserRecord) => {
    if (user.email && user.email === OWNER_EMAIL) {
        try {
            // Only set the claim if it's not already set to avoid unnecessary writes
            if (user.customClaims?.role !== 'Owner') {
                await admin.auth().setCustomUserClaims(user.uid, { role: 'Owner' });
                log(`Successfully set 'Owner' role for user: ${user.email}`);
            }
        } catch (error) {
            log(`Error setting custom claim for ${user.email}:`, error);
        }
    }
};

/**
 * This Cloud Function is triggered whenever a new user is created in Firebase Authentication.
 * It checks if the new user's email matches the designated owner's email address.
 * If it matches, it sets a custom user claim `role: 'Owner'`, granting them
 * full administrative privileges as defined in the Firestore Security Rules.
 */
exports.setOwnerRoleOnCreate = auth.user().onCreate(setOwnerClaim);


/**
 * This Cloud Function is triggered by the Eventarc 'user logged in' event.
 * It ensures the Owner role is applied even if the account was created before this function existed.
 * This is a reliable way to fix the current issue in the development environment.
 */
exports.setOwnerRoleOnLogin = eventarc.onAuthSignIn(async (event) => {
    log(`User signed in: ${event.data.uid} - ${event.data.email}`);
    await setOwnerClaim(event.data);
    return;
});


/**
 * A callable Cloud Function to allow an 'Owner' to set the role of another user.
 */
export const setUserRole = onCall({cors: true}, async (request) => {
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
    const allowedRoles = ['Owner', 'Customer'];
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
export const toggleUserStatus = onCall({cors: true}, async (request) => {
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

/**
 * A callable Cloud Function for an 'Owner' to get a list of all users
 * combined with their Firestore profile data.
 */
export const getAllUsers = onCall({cors: true}, async (request) => {
    // 1. Authentication and Authorization Check
    if (request.auth?.token.role !== 'Owner') {
        throw new HttpsError('permission-denied', 'You must be an Owner to perform this action.');
    }

    try {
        const listUsersResult = await admin.auth().listUsers();
        const firestore = admin.firestore();
        
        const combinedUsers = await Promise.all(
            listUsersResult.users.map(async (userRecord) => {
                const userDocRef = firestore.collection('users').doc(userRecord.uid);
                const userDoc = await userDocRef.get();
                
                const profileData = userDoc.exists ? userDoc.data() : {};
                
                return {
                    id: userRecord.uid,
                    email: userRecord.email || '',
                    status: userRecord.disabled ? 'Disabled' : 'Active',
                    firstName: profileData?.firstName || 'N/A',
                    lastName: profileData?.lastName || '',
                    role: profileData?.role || 'Customer',
                    roles: profileData?.roles || [],
                    createdAt: profileData?.createdAt,
                };
            })
        );
        
        return combinedUsers;

    } catch (error) {
        log('Error getting all users:', error);
        throw new HttpsError('internal', 'An error occurred while fetching the user list.');
    }
});


/**
 * A callable Cloud Function for an 'Owner' to delete a user from both
 * Firebase Authentication and Firestore.
 */
export const deleteUser = onCall({cors: true}, async (request) => {
    // 1. Authentication and Authorization Check
    if (request.auth?.token.role !== 'Owner') {
        throw new HttpsError('permission-denied', 'You must be an Owner to perform this action.');
    }

    const { userId } = request.data;
    
    // 2. Data Validation
    if (!userId) {
        throw new HttpsError('invalid-argument', 'The function must be called with a "userId" argument.');
    }
    if (request.auth.uid === userId) {
        throw new HttpsError('invalid-argument', 'You cannot delete your own account.');
    }

    try {
        // 3. Delete from Firebase Auth
        await admin.auth().deleteUser(userId);
        log(`Successfully deleted user ${userId} from Firebase Auth.`);

        // 4. Delete from Firestore
        const userDocRef = admin.firestore().collection('users').doc(userId);
        await userDocRef.delete();
        log(`Successfully deleted user profile ${userId} from Firestore.`);

        return { success: true, message: `User ${userId} has been completely removed.` };

    } catch (error: any) {
        log(`Error deleting user ${userId}:`, error);
        // Provide a more specific error message if the user is not found
        if (error.code === 'auth/user-not-found') {
            throw new HttpsError('not-found', 'The specified user does not exist.');
        }
        throw new HttpsError('internal', 'An error occurred while deleting the user.');
    }
});


/**
 * A callable Cloud Function for an 'Owner' to get aggregated analytics data for the dashboard.
 */
exports.getDashboardAnalytics = onCall({cors: true}, async (request) => {
    if (request.auth?.token.role !== 'Owner') {
        throw new HttpsError('permission-denied', 'You must be an Owner to perform this action.');
    }

    try {
        const firestore = admin.firestore();
        const settingsDoc = await firestore.collection('settings').doc('app').get();
        const settings = settingsDoc.data();

        // Fetch all data in parallel
        const [ordersSnapshot, usersSnapshot, productsSnapshot] = await Promise.all([
            firestore.collection('orders').get(),
            firestore.collection('users').get(),
            firestore.collection('products').get(),
        ]);
        
        const allOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        // --- KPI Calculations ---
        const deliveredOrders = allOrders.filter((o) => o.status === 'Delivered');
        const totalRevenue = deliveredOrders.reduce((acc, o) => acc + o.total, 0);
        const totalSales = deliveredOrders.reduce((acc, o) => acc + o.itemCount, 0);
        const pendingOrders = allOrders.filter(o => o.status === 'Pending' || o.status === 'Awaiting Confirmation').length;

        const oneMonthAgo = subMonths(new Date(), 1);
        const newCustomers = allUsers.filter(u => u.createdAt && u.createdAt.toDate() > oneMonthAgo).length;

        const totalOrders = allOrders.length;
        const totalCustomers = allUsers.length;
        const averageOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;
        const monthlyGoal = settings?.store?.monthlyRevenueGoal || 500000;
        const monthlyGoalProgress = (totalRevenue / monthlyGoal) * 100;

        // --- Sales and Revenue Chart Data (Last 6 Months) ---
        const salesData = Array.from({ length: 6 }, (_, i) => {
            const date = subMonths(new Date(), 5 - i);
            return { month: format(date, 'MMM'), sales: 0, revenue: 0 };
        });
        deliveredOrders.forEach(order => {
            const orderTimestamp = order.createdAt;
            if (orderTimestamp && orderTimestamp.toDate) {
                const month = format(orderTimestamp.toDate(), 'MMM');
                const monthIndex = salesData.findIndex(d => d.month === month);
                if (monthIndex > -1) {
                    salesData[monthIndex].sales += order.itemCount;
                    salesData[monthIndex].revenue += order.total;
                }
            }
        });
        
        // --- Daily Revenue Chart Data (Last 7 Days) ---
        const revenueData = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return { date: format(date, 'yyyy-MM-dd'), revenue: 0 };
        });
        deliveredOrders.forEach(order => {
            const orderTimestamp = order.createdAt;
            if (orderTimestamp && orderTimestamp.toDate) {
                const orderDate = orderTimestamp.toDate();
                const matchingDay = revenueData.find(d => isSameDay(new Date(d.date), orderDate));
                if (matchingDay) {
                    matchingDay.revenue += order.total;
                }
            }
        });

        // The following detailed analytics are removed because they are inefficient
        // and can cause the function to time out on larger datasets.
        const topProductsByUnits: any[] = [];
        const topProductsByRevenue: any[] = [];
        const orderStatusData = {};
        const salesByCategory = {};


        return {
            totalRevenue,
            newCustomers,
            totalSales,
            pendingOrders,
            salesData,
            revenueData,
            totalOrders,
            totalCustomers,
            averageOrderValue,
            monthlyGoal,
            monthlyGoalProgress,
            topProductsByUnits,
            topProductsByRevenue,
            orderStatusData,
            salesByCategory,
        };

    } catch (error) {
        log('Error getting dashboard analytics:', error);
        throw new HttpsError('internal', 'An error occurred while fetching dashboard analytics.');
    }
});
    

      

    

    