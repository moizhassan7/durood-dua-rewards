"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyReferral = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// Helper function to generate a secure random code
function generateReferralCode(length = 8) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = admin.firestore.Timestamp.now().seconds.toString(36);
    const randomPart = Array.from(bytes).map(() => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    return randomPart.slice(0, length);
}
// Callable function to apply referral on manual code entry.
exports.applyReferral = functions.https.onCall(async (data, context) => {
    // Security: must be authenticated
    if (!context.auth || !context.auth.uid) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const newUserId = context.auth.uid;
    const referralCode = (data && data.referralCode) ? String(data.referralCode).trim() : '';
    const points = (data && typeof data.points === 'number') ? data.points : 100;
    if (!referralCode) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing referralCode');
    }
    const newUserRef = db.doc(`users/${newUserId}`);
    let referrerId = null;
    let actualCode = referralCode;
    try {
        // --- 1. FIND THE REFERRER ID (Case-Insensitive Lookup) ---
        // Try direct lookup first
        const codeSnapDirect = await db.doc(`referralCodes/${referralCode}`).get();
        if (codeSnapDirect.exists) {
            referrerId = codeSnapDirect.data()?.userId;
        }
        else {
            // Fallback to case-insensitive lookup using the 'normalized' field
            const normalized = referralCode.toLowerCase();
            const qSnap = await db.collection('referralCodes').where('normalized', '==', normalized).limit(1).get();
            if (qSnap.empty) {
                throw new functions.https.HttpsError('not-found', 'Invalid referral code');
            }
            const foundDoc = qSnap.docs[0];
            referrerId = foundDoc.data().userId;
            actualCode = foundDoc.id; // Use the actual stored code for event recording
        }
        if (!referrerId) {
            throw new functions.https.HttpsError('not-found', 'Referral code has no associated user');
        }
        // --- 2. RUN TRANSACTION FOR ATOMIC UPDATE ---
        const result = await db.runTransaction(async (tx) => {
            if (referrerId === newUserId) {
                // self-referral
                return { applied: false, reason: 'self_referral' };
            }
            const newUserSnap = await tx.get(newUserRef);
            if (!newUserSnap.exists) {
                throw new functions.https.HttpsError('failed-precondition', 'New user document must exist before applying referral');
            }
            const newUserData = newUserSnap.data();
            if (newUserData.referredBy) {
                return { applied: false, reason: 'already_referred' };
            }
            // Optional: Ensure referral is applied within reasonable time of account creation to avoid abuse
            if (newUserData.createdAt) {
                const createdAt = newUserData.createdAt.toDate ? newUserData.createdAt.toDate() : new Date(newUserData.createdAt);
                const ageMs = Date.now() - createdAt.getTime();
                const maxAgeMs = 1000 * 60 * 60 * 24 * 7; // 7 days
                if (ageMs > maxAgeMs) {
                    return { applied: false, reason: 'account_too_old' };
                }
            }
            const referrerRef = db.doc(`users/${referrerId}`);
            const referrerSnap = await tx.get(referrerRef);
            if (!referrerSnap.exists) {
                return { applied: false, reason: 'referrer_not_found' };
            }
            // Basic abuse check: don't allow an extremely high referralCount
            const referrerData = referrerSnap.data();
            const existingReferralCount = (referrerData.referralCount || 0);
            const maxReferrals = 10000; // arbitrary high limit
            if (existingReferralCount >= maxReferrals) {
                return { applied: false, reason: 'referrer_limit' };
            }
            const updates = {
                referredBy: referrerId,
                referredAt: admin.firestore.FieldValue.serverTimestamp(),
                totalCount: admin.firestore.FieldValue.increment(points),
                monthCount: admin.firestore.FieldValue.increment(points),
            };
            // If new user doesn't have a referral code, generate one
            if (!newUserData.referralCode) {
                const newCode = generateReferralCode();
                const codeRef = db.doc(`referralCodes/${newCode}`);
                tx.set(codeRef, {
                    userId: newUserId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    normalized: newCode.toLowerCase()
                });
                updates.referralCode = newCode;
            }
            // Update both users atomically
            tx.update(newUserRef, updates);
            // Update referrer
            tx.update(referrerRef, {
                totalCount: admin.firestore.FieldValue.increment(points),
                monthCount: admin.firestore.FieldValue.increment(points),
                referralCount: admin.firestore.FieldValue.increment(1),
            });
            const referralEventRef = db.collection('referrals').doc();
            console.log('Updating points for both users and recording event');
            tx.set(referralEventRef, {
                referralCode: actualCode,
                referrerId,
                referredId: newUserId,
                pointsAwarded: points,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return { applied: true };
        });
        return result;
    }
    catch (err) {
        if (err instanceof functions.https.HttpsError)
            throw err;
        console.error('applyReferral error:', err);
        throw new functions.https.HttpsError('internal', 'Internal error applying referral');
    }
});
