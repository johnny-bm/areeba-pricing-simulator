/**
 * Infrastructure Error Classes
 * 
 * Error hierarchy for infrastructure layer failures
 */

export class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'InfrastructureError';
  }
}

export class DatabaseConnectionError extends InfrastructureError {
  constructor(message: string, originalError?: Error) {
    super(`Database connection failed: ${message}`, originalError);
    this.name = 'DatabaseConnectionError';
  }
}

export class DatabaseQueryError extends InfrastructureError {
  constructor(query: string, originalError?: Error) {
    super(`Query failed: ${query}`, originalError);
    this.name = 'DatabaseQueryError';
  }
}

export class DatabaseNotFoundError extends InfrastructureError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found in database`);
    this.name = 'DatabaseNotFoundError';
  }
}

export class DatabaseValidationError extends InfrastructureError {
  constructor(field: string, message: string) {
    super(`Database validation failed for ${field}: ${message}`);
    this.name = 'DatabaseValidationError';
  }
}
