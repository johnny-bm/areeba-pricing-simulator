/**
 * Application Error Hierarchy
 * 
 * Base error class for all application layer errors
 */

export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class ValidationError extends ApplicationError {
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class BusinessRuleError extends ApplicationError {
  constructor(rule: string, message: string) {
    super(`Business rule violation: ${rule} - ${message}`);
    this.name = 'BusinessRuleError';
  }
}

export class InfrastructureError extends ApplicationError {
  constructor(service: string, message: string) {
    super(`Infrastructure error in ${service}: ${message}`);
    this.name = 'InfrastructureError';
  }
}
