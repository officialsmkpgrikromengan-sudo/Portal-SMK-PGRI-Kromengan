/**
 * Compatibility Layer: Migrated from Firebase to SQLite
 * All operations now run directly against the single SQLite database via /api.
 */

export * from './api';

// Stubs for legacy direct references (if any)
export const auth: any = {
  currentUser: null,
  onAuthStateChanged: (cb: any) => {
    cb(null);
    return () => {};
  }
};

export const db: any = {};
