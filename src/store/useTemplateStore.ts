import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TemplateType = 'dockerfile' | 'compose' | 'kubernetes' | 'fullstack';

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  category?: string;
  createdAt: number;
  data: any; // Snapshots of relevant stores
}

interface TemplateState {
  templates: Template[];
  categories: Record<string, string[]>; // { dockerfile: ['Base', 'Web'], ... }
  saveTemplate: (name: string, type: TemplateType, data: any, category?: string) => void;
  deleteTemplate: (id: string) => void;
  getTemplatesByType: (type: TemplateType | 'all') => Template[];
  addCategory: (type: TemplateType, name: string) => void;
  deleteCategory: (type: TemplateType, name: string) => void;
  renameCategory: (type: TemplateType, oldName: string, newName: string) => void;
  updateTemplateCategory: (id: string, category: string | undefined) => void;
  deleteTemplates: (ids: string[]) => void;
  bulkUpdateCategory: (ids: string[], category: string | undefined) => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      categories: {
        dockerfile: [],
        compose: [],
        kubernetes: [],
        fullstack: []
      },

      saveTemplate: (name, type, data, category) => {
        const newTemplate: Template = {
          id: Math.random().toString(36).slice(2, 9),
          name,
          type,
          category,
          createdAt: Date.now(),
          data: JSON.parse(JSON.stringify(data)), // Deep clone
        };
        set((state) => ({
          templates: [newTemplate, ...state.templates],
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      updateTemplateCategory: (id, category) => {
        set((state) => ({
          templates: state.templates.map(t => t.id === id ? { ...t, category } : t)
        }));
      },

      getTemplatesByType: (type) => {
        if (type === 'all') return get().templates;
        return get().templates.filter((t) => t.type === type);
      },

      addCategory: (type, name) => {
        const current = get().categories[type] || [];
        if (current.includes(name)) return;
        set((state) => ({
          categories: {
            ...state.categories,
            [type]: [...current, name]
          }
        }));
      },

      deleteCategory: (type, name) => {
        set((state) => {
          const newCategories = { ...state.categories };
          newCategories[type] = (newCategories[type] || []).filter(c => c !== name);
          
          // Also clear category from templates of this type
          const newTemplates = state.templates.map(t => 
            (t.type === type && t.category === name) ? { ...t, category: undefined } : t
          );
          
          return { categories: newCategories, templates: newTemplates };
        });
      },

      renameCategory: (type, oldName, newName) => {
        set((state) => {
          const newCategories = { ...state.categories };
          newCategories[type] = (newCategories[type] || []).map(c => c === oldName ? newName : c);
          
          const newTemplates = state.templates.map(t => 
            (t.type === type && t.category === oldName) ? { ...t, category: newName } : t
          );
          
          return { categories: newCategories, templates: newTemplates };
        });
      },
      
      deleteTemplates: (ids) => {
        set((state) => ({
          templates: state.templates.filter((t) => !ids.includes(t.id)),
        }));
      },

      bulkUpdateCategory: (ids, category) => {
        set((state) => ({
          templates: state.templates.map(t => ids.includes(t.id) ? { ...t, category } : t)
        }));
      }
    }),
    {
      name: 'zeroyaml-templates',
    }
  )
);
