'use client';

import { useState, useEffect, useCallback } from 'react';

interface VideoData {
  vod_id: string;
  vod_name: string;
  vod_pic?: string;
  vod_content?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_year?: string;
  vod_area?: string;
  type_name?: string;
  episodes?: Array<{ name?: string; url: string }>;
}

interface UseVideoPlayerReturn {
  videoData: VideoData | null;
  loading: boolean;
  videoError: string;
  currentEpisode: number;
  playUrl: string;
  setCurrentEpisode: (index: number) => void;
  setPlayUrl: (url: string) => void;
  setVideoError: (error: string) => void;
  fetchVideoDetails: () => Promise<void>;
}



export function useVideoPlayer(
  videoId: string | null,
  source: string | null,
  episodeParam: string | null
): UseVideoPlayerReturn {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [playUrl, setPlayUrl] = useState('');
  const [videoError, setVideoError] = useState<string>('');

  const fetchVideoDetails = useCallback(async () => {
    if (!videoId || !source) return;

    try {
      setVideoError('');
      setLoading(true);

      const response = await fetch(`/api/detail?id=${videoId}&source=${source}`);
      const data = await response.json();



      if (!response.ok) {
        if (response.status === 404) {
          setVideoError(data.error || 'This video source is not available. Please go back and try another source.');
          setLoading(false);
          return;
        }
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success && data.data) {


        setVideoData(data.data);
        setLoading(false);

        if (data.data.episodes && data.data.episodes.length > 0) {
          const episodeIndex = episodeParam ? parseInt(episodeParam, 10) : 0;
          const validIndex = (episodeIndex >= 0 && episodeIndex < data.data.episodes.length) ? episodeIndex : 0;

          const episodeUrl = data.data.episodes[validIndex].url;

          setCurrentEpisode(validIndex);
          setPlayUrl(episodeUrl);
        } else {
          console.warn('No episodes found in video data');
          setVideoError('No playable episodes available for this video from this source');
        }
      } else {
        throw new Error(data.error || 'Invalid response from API');
      }
    } catch (error) {
      console.error('Failed to fetch video details:', error);
      setVideoError(error instanceof Error ? error.message : 'Failed to load video details. Please try another source.');
      setLoading(false);
    }
  }, [videoId, source, episodeParam]);

  useEffect(() => {
    if (videoId && source) {
      fetchVideoDetails();
    }
  }, [videoId, source, fetchVideoDetails]);

  return {
    videoData,
    loading,
    videoError,
    currentEpisode,
    playUrl,
    setCurrentEpisode,
    setPlayUrl,
    setVideoError,
    fetchVideoDetails,
  };
}
