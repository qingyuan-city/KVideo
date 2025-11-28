/**
 * Video Source Configuration and Management
 * Handles third-party video API sources with validation and health checks
 */

import type { VideoSource } from '@/lib/types';
import { DEFAULT_SOURCES } from './default-sources';
import { ADULT_SOURCES } from './adult-sources';

/**
 * Get source by ID from both default and adult sources
 */
export function getSourceById(id: string): VideoSource | undefined {
  // Search in default sources first
  const defaultSource = DEFAULT_SOURCES.find(source => source.id === id);
  if (defaultSource) {
    return defaultSource;
  }

  // Search in adult sources
  return ADULT_SOURCES.find(source => source.id === id);
}


