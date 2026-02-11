import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface DoubanSubject {
  id: string;
  title: string;
  cover?: string;
  rate?: string;
  url?: string;
}

interface DoubanRecommendResponse {
  subjects?: DoubanSubject[];
}

interface ImdbInfo {
  imdbRating: string | null;
  imdbUrl: string | null;
}

interface OmdbSearchItem {
  imdbID?: string;
}

interface OmdbSearchResponse {
  Response?: string;
  Search?: OmdbSearchItem[];
}

interface OmdbRatingResponse {
  Response?: string;
  imdbRating?: string;
}

async function fetchImdbInfo(title: string, type: string): Promise<ImdbInfo> {
  const omdbApiKey = process.env.OMDB_API_KEY;

  if (!omdbApiKey || !title) {
    return {
      imdbRating: null,
      imdbUrl: null,
    };
  }

  try {
    const searchUrl = new URL('https://www.omdbapi.com/');
    searchUrl.searchParams.set('apikey', omdbApiKey);
    searchUrl.searchParams.set('s', title);
    searchUrl.searchParams.set('type', type === 'tv' ? 'series' : 'movie');

    const searchResponse = await fetch(searchUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!searchResponse.ok) {
      return {
        imdbRating: null,
        imdbUrl: null,
      };
    }

    const searchData = await searchResponse.json() as OmdbSearchResponse;
    const imdbID = searchData.Search?.[0]?.imdbID;

    if (!imdbID) {
      return {
        imdbRating: null,
        imdbUrl: null,
      };
    }

    const ratingUrl = new URL('https://www.omdbapi.com/');
    ratingUrl.searchParams.set('apikey', omdbApiKey);
    ratingUrl.searchParams.set('i', imdbID);

    const ratingResponse = await fetch(ratingUrl, {
      next: { revalidate: 86400 },
    });

    if (!ratingResponse.ok) {
      return {
        imdbRating: null,
        imdbUrl: `https://www.imdb.com/title/${imdbID}/`,
      };
    }

    const ratingData = await ratingResponse.json() as OmdbRatingResponse;
    const imdbRating = ratingData.Response === 'True' && ratingData.imdbRating && ratingData.imdbRating !== 'N/A'
      ? ratingData.imdbRating
      : null;

    return {
      imdbRating,
      imdbUrl: `https://www.imdb.com/title/${imdbID}/`,
    };
  } catch {
    return {
      imdbRating: null,
      imdbUrl: null,
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag') || '热门';
  const pageLimit = searchParams.get('page_limit') || '20';
  const pageStart = searchParams.get('page_start') || '0';
  const type = searchParams.get('type') || 'movie'; // movie or tv

  try {
    const url = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURIComponent(tag)}&sort=recommend&page_limit=${pageLimit}&page_start=${pageStart}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://movie.douban.com/',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Douban API returned ${response.status}`);
    }

    const data = await response.json() as DoubanRecommendResponse;

    // 转换图片链接使用代理，并补充 IMDb 评分
    if (data.subjects && Array.isArray(data.subjects)) {
      data.subjects = await Promise.all(data.subjects.map(async (item) => {
        const imdbInfo = await fetchImdbInfo(item.title, type);
        return {
          ...item,
          cover: item.cover ? `/api/douban/image?url=${encodeURIComponent(item.cover)}` : item.cover,
          ...imdbInfo,
        };
      }));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Douban API error:', error);
    return NextResponse.json(
      { subjects: [], error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
