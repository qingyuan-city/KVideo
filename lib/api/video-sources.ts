/**
 * Video Source Configuration and Management
 * Handles third-party video API sources with validation and health checks
 */

import type { VideoSource } from '@/lib/types';
import { DEFAULT_SOURCES } from './default-sources';

/**
 * Get source by ID
 */
export function getSourceById(id: string): VideoSource | undefined {
  return DEFAULT_SOURCES.find(source => source.id === id);
}


