/**
 * UI Slice Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createUISlice } from '../ui.slice';
import { UIState, UIActions } from '../../types';

type UIStore = UIState & UIActions;

const createUIStore = () => create<UIStore>()((...args) => createUISlice(...args));

describe('UI Slice', () => {
  let store: ReturnType<typeof createUIStore>;

  beforeEach(() => {
    store = createUIStore();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState();
      
      expect(state.sidebarOpen).toBe(false);
      expect(state.theme).toBe('light');
      expect(state.activeModal).toBeNull();
      expect(state.notifications).toEqual([]);
    });
  });

  describe('Sidebar Management', () => {
    it('should toggle sidebar correctly', () => {
      store.getState().toggleSidebar();
      
      let state = store.getState();
      expect(state.sidebarOpen).toBe(true);
      
      store.getState().toggleSidebar();
      state = store.getState();
      expect(state.sidebarOpen).toBe(false);
    });

    it('should set sidebar open state correctly', () => {
      store.getState().setSidebarOpen(true);
      
      let state = store.getState();
      expect(state.sidebarOpen).toBe(true);
      
      store.getState().setSidebarOpen(false);
      state = store.getState();
      expect(state.sidebarOpen).toBe(false);
    });
  });

  describe('Theme Management', () => {
    it('should set theme correctly', () => {
      store.getState().setTheme('dark');
      
      let state = store.getState();
      expect(state.theme).toBe('dark');
      
      store.getState().setTheme('light');
      state = store.getState();
      expect(state.theme).toBe('light');
    });
  });

  describe('Modal Management', () => {
    it('should open modal correctly', () => {
      store.getState().openModal('test-modal');
      
      const state = store.getState();
      expect(state.activeModal).toBe('test-modal');
    });

    it('should close modal correctly', () => {
      store.getState().openModal('test-modal');
      store.getState().closeModal();
      
      const state = store.getState();
      expect(state.activeModal).toBeNull();
    });
  });

  describe('Notification Management', () => {
    it('should add notification correctly', () => {
      const notification = {
        type: 'success' as const,
        title: 'Success',
        message: 'Operation completed',
      };

      store.getState().addNotification(notification);
      
      const state = store.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0]).toMatchObject(notification);
      expect(state.notifications[0].id).toBeTruthy();
    });

    it('should remove notification correctly', () => {
      const notification = {
        type: 'success' as const,
        title: 'Success',
        message: 'Operation completed',
      };

      store.getState().addNotification(notification);
      const notificationId = store.getState().notifications[0].id;
      
      store.getState().removeNotification(notificationId);
      
      const state = store.getState();
      expect(state.notifications).toHaveLength(0);
    });

    it('should clear all notifications correctly', () => {
      store.getState().addNotification({
        type: 'success',
        title: 'Success 1',
        message: 'Message 1',
      });
      store.getState().addNotification({
        type: 'error',
        title: 'Error 1',
        message: 'Message 2',
      });
      
      store.getState().clearNotifications();
      
      const state = store.getState();
      expect(state.notifications).toHaveLength(0);
    });

    it('should auto-remove notification after duration', async () => {
      const notification = {
        type: 'info' as const,
        title: 'Info',
        message: 'This will auto-remove',
        duration: 100, // 100ms for testing
      };

      store.getState().addNotification(notification);
      
      let state = store.getState();
      expect(state.notifications).toHaveLength(1);
      
      // Wait for auto-removal
      await new Promise(resolve => setTimeout(resolve, 150));
      
      state = store.getState();
      expect(state.notifications).toHaveLength(0);
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state when adding notifications', () => {
      const initialState = store.getState();
      const notification = {
        type: 'success' as const,
        title: 'Success',
        message: 'Operation completed',
      };

      store.getState().addNotification(notification);
      
      // Original state should be unchanged
      expect(initialState.notifications).toHaveLength(0);
      
      // New state should be updated
      const newState = store.getState();
      expect(newState.notifications).toHaveLength(1);
    });
  });
});
