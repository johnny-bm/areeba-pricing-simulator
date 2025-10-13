/**
 * Category Entity
 * 
 * Represents a pricing category with business rules
 * Immutable entity following DDD principles
 */

import { CategoryData } from '../types';

export class Category {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly order: number;

  constructor(id: string, name: string, description: string = '', order: number = 0) {
    this.validateId(id);
    this.validateName(name);
    this.validateOrder(order);
    
    this.id = id;
    this.name = name;
    this.description = description;
    this.order = order;
  }

  private validateId(id: string): void {
    if (!id || typeof id !== 'string') {
      throw new Error('Category ID is required');
    }
    
    if (id.trim().length === 0) {
      throw new Error('Category ID cannot be empty');
    }
    
    if (id.length > 50) {
      throw new Error('Category ID cannot exceed 50 characters');
    }
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Category name is required');
    }
    
    if (name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }
    
    if (name.length > 100) {
      throw new Error('Category name cannot exceed 100 characters');
    }
  }

  private validateOrder(order: number): void {
    if (typeof order !== 'number' || isNaN(order)) {
      throw new Error('Order must be a valid number');
    }
    
    if (order < 0) {
      throw new Error('Order cannot be negative');
    }
    
    if (!Number.isInteger(order)) {
      throw new Error('Order must be an integer');
    }
  }

  /**
   * Update category name
   */
  updateName(name: string): Category {
    return new Category(this.id, name, this.description, this.order);
  }

  /**
   * Update category description
   */
  updateDescription(description: string): Category {
    return new Category(this.id, this.name, description, this.order);
  }

  /**
   * Update category order
   */
  updateOrder(order: number): Category {
    return new Category(this.id, this.name, this.description, order);
  }

  /**
   * Check if category has description
   */
  hasDescription(): boolean {
    return this.description.trim().length > 0;
  }

  /**
   * Get display name (name with order prefix if order > 0)
   */
  getDisplayName(): string {
    if (this.order > 0) {
      return `${this.order}. ${this.name}`;
    }
    return this.name;
  }

  /**
   * Check if this category equals another
   */
  equals(other: Category): boolean {
    if (!(other instanceof Category)) {
      return false;
    }
    
    return this.id === other.id;
  }

  /**
   * Check if this category comes before another in order
   */
  comesBefore(other: Category): boolean {
    return this.order < other.order;
  }

  /**
   * Check if this category comes after another in order
   */
  comesAfter(other: Category): boolean {
    return this.order > other.order;
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): CategoryData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      order: this.order,
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: CategoryData): Category {
    return new Category(
      data.id,
      data.name,
      data.description || '',
      data.order || 0
    );
  }

  /**
   * Create a new category
   */
  static create(data: {
    id: string;
    name: string;
    description?: string;
    order?: number;
  }): Category {
    return new Category(
      data.id,
      data.name,
      data.description || '',
      data.order || 0
    );
  }

  /**
   * Create a category with auto-generated ID
   */
  static createWithId(name: string, description?: string, order?: number): Category {
    const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return new Category(id, name, description || '', order || 0);
  }
}
