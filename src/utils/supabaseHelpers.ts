import { supabase } from './supabase/client';

/**
 * Generic function to query data by simulator ID
 * @param table - Table name to query
 * @param simulatorId - Simulator ID to filter by
 * @param select - Fields to select (default: '*')
 * @param orderBy - Field to order by (default: 'created_at')
 * @param ascending - Sort order (default: false)
 * @returns Promise<T[]> - Array of results
 */
export async function queryBySimulator<T>(
  table: string,
  simulatorId: string,
  select = '*',
  orderBy = 'created_at',
  ascending = false
): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq('simulator_id', simulatorId)
    .is('deleted_at', null)
    .order(orderBy, { ascending });

  if (error) {
    throw new Error(`Failed to load ${table}: ${error.message}`);
  }

  return (data as T[]) || [];
}

/**
 * Generic function to query all data from a table (no simulator filter)
 * @param table - Table name to query
 * @param select - Fields to select (default: '*')
 * @param orderBy - Field to order by (default: 'created_at')
 * @param ascending - Sort order (default: false)
 * @returns Promise<T[]> - Array of results
 */
export async function queryAll<T>(
  table: string,
  select = '*',
  orderBy = 'created_at',
  ascending = false
): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .is('deleted_at', null)
    .order(orderBy, { ascending });

  if (error) {
    throw new Error(`Failed to load ${table}: ${error.message}`);
  }

  return (data as T[]) || [];
}

/**
 * Generic function to soft delete records
 * @param table - Table name
 * @param ids - Array of IDs to delete
 * @param userId - User ID for audit trail
 * @returns Promise<void>
 */
export async function softDeleteRecords(
  table: string,
  ids: string[],
  userId: string
): Promise<void> {
  if (ids.length === 0) return;

  const timestamp = new Date().toISOString();
  
  const { error } = await supabase
    .from(table)
    .update({
      deleted_at: timestamp,
      updated_by: userId,
      updated_at: timestamp
    })
    .in('id', ids);

  if (error) {
    throw new Error(`Failed to delete ${table} records: ${error.message}`);
  }
}

/**
 * Generic function to upsert records
 * @param table - Table name
 * @param records - Array of records to upsert
 * @param userId - User ID for audit trail
 * @returns Promise<T[]> - Array of upserted records
 */
export async function upsertRecords<T>(
  table: string,
  records: any[],
  userId: string
): Promise<T[]> {
  if (records.length === 0) return [];

  const timestamp = new Date().toISOString();
  
  // Add audit fields to all records
  const recordsWithAudit = records.map(record => ({
    ...record,
    updated_by: userId,
    updated_at: timestamp,
    created_at: record.id ? undefined : timestamp // Only set created_at for new records
  }));

  const { data, error } = await supabase
    .from(table)
    .upsert(recordsWithAudit)
    .select();

  if (error) {
    throw new Error(`Failed to upsert ${table} records: ${error.message}`);
  }

  return (data as T[]) || [];
}
