/**
 * Document Slice
 * 
 * Manages document state including PDF generation and templates
 */

import { StateCreator } from 'zustand';
import { DocumentState, DocumentActions, Document, Template } from '../types';

export const createDocumentSlice: StateCreator<
  any,
  [],
  [],
  DocumentState & DocumentActions
> = (set, get) => ({
  // Initial State
  currentDocument: null,
  templates: [],
  isGenerating: false,
  error: null,

  // Actions
  setDocument: (document: Document | null) => {
    set((state) => ({
      document: {
        ...state.document,
        currentDocument: document,
      },
    }));
  },

  generatePDF: async (documentId: string) => {
    set((state) => ({
      document: {
        ...state.document,
        isGenerating: true,
        error: null,
      },
    }));

    try {
      // TODO: Replace with actual DocumentService call
      // const pdfUrl = await DocumentService.generatePDF(documentId);
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate generation time
      
      set((state) => ({
        document: {
          ...state.document,
          isGenerating: false,
          error: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        document: {
          ...state.document,
          isGenerating: false,
          error: error instanceof Error ? error.message : 'PDF generation failed',
        },
      }));
      throw error;
    }
  },

  loadTemplates: async () => {
    set((state) => ({
      document: {
        ...state.document,
        isGenerating: true,
        error: null,
      },
    }));

    try {
      // TODO: Replace with actual DocumentService call
      // const templates = await DocumentService.getTemplates();
      
      // Mock implementation for now
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Standard Proposal',
          type: 'proposal',
          content: '<h1>Proposal Template</h1>',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Quick Quote',
          type: 'quote',
          content: '<h1>Quote Template</h1>',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Invoice Template',
          type: 'invoice',
          content: '<h1>Invoice Template</h1>',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      set((state) => ({
        document: {
          ...state.document,
          templates: mockTemplates,
          isGenerating: false,
          error: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        document: {
          ...state.document,
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Failed to load templates',
        },
      }));
      throw error;
    }
  },

  setTemplates: (templates: Template[]) => {
    set((state) => ({
      document: {
        ...state.document,
        templates,
      },
    }));
  },

  setGenerating: (generating: boolean) => {
    set((state) => ({
      document: {
        ...state.document,
        isGenerating: generating,
      },
    }));
  },

  setError: (error: string | null) => {
    set((state) => ({
      document: {
        ...state.document,
        error,
      },
    }));
  },

  reset: () => {
    set((state) => ({
      document: {
        ...state.document,
        currentDocument: null,
        templates: [],
        isGenerating: false,
        error: null,
      },
    }));
  },
});
