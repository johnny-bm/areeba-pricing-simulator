/**
 * DateRange Value Object
 * 
 * Represents a date range with start and optional end date
 * Immutable value object following DDD principles
 */

import { DateRangeData } from '../types';

export class DateRange {
  public readonly startDate: Date;
  public readonly endDate: Date | null;

  constructor(startDate: Date, endDate?: Date | null) {
    this.validateDates(startDate, endDate);
    
    this.startDate = new Date(startDate.getTime()); // Create new instance
    this.endDate = endDate ? new Date(endDate.getTime()) : null;
  }

  private validateDates(startDate: Date, endDate?: Date | null): void {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Start date must be a valid date');
    }
    
    if (endDate !== null && endDate !== undefined) {
      if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
        throw new Error('End date must be a valid date');
      }
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }
  }

  /**
   * Check if a date falls within this range
   */
  contains(date: Date): boolean {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    
    const isAfterStart = date >= this.startDate;
    const isBeforeEnd = this.endDate ? date <= this.endDate : true;
    
    return isAfterStart && isBeforeEnd;
  }

  /**
   * Check if the range is currently active (today is within range)
   */
  isActive(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return this.contains(today);
  }

  /**
   * Check if the range has ended
   */
  hasEnded(): boolean {
    if (!this.endDate) {
      return false; // Open-ended range
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return today > this.endDate;
  }

  /**
   * Check if the range has started
   */
  hasStarted(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return today >= this.startDate;
  }

  /**
   * Get duration in days
   */
  getDurationDays(): number {
    if (!this.endDate) {
      throw new Error('Cannot calculate duration for open-ended range');
    }
    
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get duration in months (approximate)
   */
  getDurationMonths(): number {
    if (!this.endDate) {
      throw new Error('Cannot calculate duration for open-ended range');
    }
    
    const startYear = this.startDate.getFullYear();
    const startMonth = this.startDate.getMonth();
    const endYear = this.endDate.getFullYear();
    const endMonth = this.endDate.getMonth();
    
    return (endYear - startYear) * 12 + (endMonth - startMonth);
  }

  /**
   * Check if this range overlaps with another range
   */
  overlaps(other: DateRange): boolean {
    // If either range is open-ended, they overlap if they start before the other ends
    if (!this.endDate && !other.endDate) {
      return true; // Both open-ended
    }
    
    if (!this.endDate) {
      return other.startDate <= this.startDate || (other.endDate && other.endDate >= this.startDate);
    }
    
    if (!other.endDate) {
      return this.startDate <= other.startDate || this.endDate >= other.startDate;
    }
    
    // Both have end dates
    return this.startDate < other.endDate && this.endDate > other.startDate;
  }

  /**
   * Get intersection with another range
   */
  getIntersection(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) {
      return null;
    }
    
    const intersectionStart = this.startDate > other.startDate ? this.startDate : other.startDate;
    const intersectionEnd = this.endDate && other.endDate 
      ? (this.endDate < other.endDate ? this.endDate : other.endDate)
      : (this.endDate || other.endDate);
    
    return new DateRange(intersectionStart, intersectionEnd);
  }

  /**
   * Format as human-readable string
   */
  format(): string {
    const startStr = this.startDate.toLocaleDateString();
    
    if (!this.endDate) {
      return `From ${startStr} (ongoing)`;
    }
    
    const endStr = this.endDate.toLocaleDateString();
    return `From ${startStr} to ${endStr}`;
  }

  /**
   * Format as ISO date range string
   */
  formatISO(): string {
    const startISO = this.startDate.toISOString().split('T')[0];
    
    if (!this.endDate) {
      return `${startISO}/..`;
    }
    
    const endISO = this.endDate.toISOString().split('T')[0];
    return `${startISO}/${endISO}`;
  }

  /**
   * Check if this range equals another
   */
  equals(other: DateRange): boolean {
    if (!(other instanceof DateRange)) {
      return false;
    }
    
    const startEqual = this.startDate.getTime() === other.startDate.getTime();
    const endEqual = this.endDate?.getTime() === other.endDate?.getTime();
    
    return startEqual && endEqual;
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): DateRangeData {
    return {
      startDate: this.startDate.toISOString(),
      endDate: this.endDate?.toISOString(),
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: DateRangeData): DateRange {
    const startDate = new Date(data.startDate);
    const endDate = data.endDate ? new Date(data.endDate) : null;
    
    return new DateRange(startDate, endDate);
  }

  /**
   * Create a range starting today
   */
  static fromToday(days: number): DateRange {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    
    return new DateRange(startDate, endDate);
  }

  /**
   * Create a range for the current month
   */
  static currentMonth(): DateRange {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return new DateRange(startDate, endDate);
  }

  /**
   * Create a range for the current year
   */
  static currentYear(): DateRange {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const endDate = new Date(now.getFullYear(), 11, 31);
    
    return new DateRange(startDate, endDate);
  }
}
