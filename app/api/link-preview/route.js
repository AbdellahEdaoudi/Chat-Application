import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Basic validation
    new URL(url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({});
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const getMetaTag = (name) => {
      return (
        $(`meta[property="${name}"]`).attr('content') ||
        $(`meta[name="${name}"]`).attr('content')
      );
    };

    let title = getMetaTag('og:title') || $('title').text() || '';
    let description = getMetaTag('og:description') || getMetaTag('description') || '';
    let image = getMetaTag('og:image') || '';
    let siteName = getMetaTag('og:site_name') || '';

    // If image is relative, make it absolute
    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url);
      image = new URL(image, urlObj.origin).toString();
    }

    return NextResponse.json({
      title,
      description,
      image,
      siteName,
      url,
    });
  } catch (error) {
    // Return empty metadata silently on any fetch error (e.g. ENOTFOUND)
    return NextResponse.json({});
  }
}
