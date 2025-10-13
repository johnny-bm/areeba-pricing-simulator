import { supabase } from './supabase/client';

export interface SystemVersion {
  id: string;
  version: string;
  major: number;
  minor: number;
  patch: number;
  build_number: number;
  release_notes?: string;
  is_current: boolean;
  created_at: string;
  deployed_at?: string;
}

export class VersionService {
  /**
   * Get the current system version
   */
  static async getCurrentVersion(): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('get_current_version');
      
      if (error) {
        // // console.error('Error getting current version:', error);
        return '1.0.0'; // Fallback version
      }
      
      return data || '1.0.0';
    } catch (error) {
      // // console.error('Error getting current version:', error);
      return '1.0.0';
    }
  }

  /**
   * Get all system versions
   */
  static async getAllVersions(): Promise<SystemVersion[]> {
    try {
      const { data, error } = await supabase
        .from('system_versions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        // // console.error('Error getting versions:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      // // console.error('Error getting versions:', error);
      return [];
    }
  }

  /**
   * Increment system version (admin only)
   */
  static async incrementVersion(
    major?: number,
    minor?: number,
    patch?: number,
    releaseNotes?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('increment_system_version', {
          p_major: major,
          p_minor: minor,
          p_patch: patch,
          p_release_notes: releaseNotes
        });
      
      if (error) {
        // // console.error('Error incrementing version:', error);
        throw new Error('Failed to increment version');
      }
      
      return data;
    } catch (error) {
      // // console.error('Error incrementing version:', error);
      throw error;
    }
  }

  /**
   * Get version info for display
   */
  static async getVersionInfo(): Promise<{
    currentVersion: string;
    buildNumber: number;
    releaseNotes?: string;
    deployedAt?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('system_versions')
        .select('version, build_number, release_notes, deployed_at')
        .eq('is_current', true)
        .single();
      
      if (error) {
        // // console.error('Error getting version info:', error);
        return {
          currentVersion: '1.0.0',
          buildNumber: 1,
          releaseNotes: 'System version'
        };
      }
      
      return {
        currentVersion: data.version,
        buildNumber: data.build_number,
        releaseNotes: data.release_notes,
        deployedAt: data.deployed_at
      };
    } catch (error) {
      // // console.error('Error getting version info:', error);
      return {
        currentVersion: '1.0.0',
        buildNumber: 1,
        releaseNotes: 'System version'
      };
    }
  }
}
