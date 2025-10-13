/**
 * UI Slice
 * 
 * Manages UI state including theme, modals, and notifications
 */

import { StateCreator } from 'zustand';
import { UIState, UIActions, Notification } from '../types';

export const createUISlice: StateCreator<
  any,
  [],
  [],
  UIState & UIActions
> = (set) => ({
  // Initial State
  sidebarOpen: false,
  theme: 'light',
  activeModal: null,
  notifications: [],

  // Actions
  toggleSidebar: () => {
    set((state) => ({
      ...state,
      sidebarOpen: !state.sidebarOpen,
    }));
  },

  setSidebarOpen: (open: boolean) => {
    set((state) => ({
      ...state,
      sidebarOpen: open,
    }));
  },

  setTheme: (theme: 'light' | 'dark') => {
    set((state) => ({
      ...state,
      theme,
    }));
  },

  openModal: (modalId: string) => {
    set((state) => ({
      ...state,
      activeModal: modalId,
    }));
  },

  closeModal: () => {
    set((state) => ({
      ...state,
      activeModal: null,
    }));
  },

  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
    };

    set((state) => ({
      ...state,
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          ...state,
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      ...state,
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set((state) => ({
      ...state,
      notifications: [],
    }));
  },
});
