// Auth module for login validation and session management

import { STORAGE_KEY, PAGE_URL } from './constants.js';
import { dataPengguna } from './data.js';

export const Auth = {
  SESSION_KEY: STORAGE_KEY.SESSION,

  // Validate login credentials against dataPengguna
  validateLogin(email, password) {
    const user = dataPengguna.find(u => u.email === email && u.password === password);
    return user || null;
  },

  // Create session in localStorage
  createSession(user) {
    const session = {
      userEmail: user.email,
      userName: user.nama,
      userRole: user.role,
      userLocation: user.lokasi,
      timestamp: Date.now()
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return session;
  },

  // Get current session
  getSession() {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return this.getSession() !== null;
  },

  // Destroy session and logout
  destroySession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  // Redirect to login if not authenticated
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = PAGE_URL.LOGIN;
    }
  },

  // Redirect to dashboard if already authenticated
  redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      window.location.href = PAGE_URL.DASHBOARD;
    }
  }
};
