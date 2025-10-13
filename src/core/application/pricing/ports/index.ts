// Pricing ports barrel export
// Repository interfaces and other ports
export interface IPricingRepository {
  findById(id: string): Promise<any>;
  findAll(): Promise<any[]>;
  save(entity: any): Promise<void>;
  update(entity: any): Promise<void>;
  delete(id: string): Promise<void>;
}
