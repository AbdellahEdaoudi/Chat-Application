"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LinkPreview({ url, isMe }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        
        if (!isMounted) return;

        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        
        if (!isMounted) return;

        // Only show preview if we have at least a title or image
        if (data.title || data.image) {
          setMetadata(data);
        } else {
          setError(true);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Link preview not available for this URL');
          setError(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (url) {
      const timeoutId = setTimeout(() => {
        fetchMetadata();
      }, 500); // 500ms debounce
      
      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }
  }, [url]);

  if (loading) {
    return (
      <div className={`mt-2 w-full border rounded-lg overflow-hidden animate-pulse flex h-[72px] ${isMe ? 'border-white/20' : 'border-gray-200'}`}>
        <div className={`w-[72px] shrink-0 ${isMe ? 'bg-white/20' : 'bg-gray-300'}`}></div>
        <div className={`p-2 flex-1 flex flex-col justify-center ${isMe ? 'bg-black/10' : 'bg-gray-50'}`}>
          <div className={`h-3 rounded w-3/4 mb-2 ${isMe ? 'bg-white/30' : 'bg-gray-300'}`}></div>
          <div className={`h-2 rounded w-1/2 ${isMe ? 'bg-white/30' : 'bg-gray-300'}`}></div>
        </div>
      </div>
    );
  }

  if (error || !metadata) {
    return null;
  }

  // Get domain name for display
  let domain = '';
  try {
    domain = new URL(url).hostname.replace('www.', '');
  } catch (e) {
    domain = url;
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`mt-1 flex min-h-[72px] w-full border rounded-lg overflow-hidden transition-colors duration-200 shadow-sm ${
        isMe ? 'border-white/20 bg-black/10 hover:bg-black/20' : 'border-gray-200/80 bg-black/5 hover:bg-black/10'
      }`}
    >
      {metadata.image && (
        <div className={`relative w-[72px] shrink-0 border-r ${isMe ? 'border-white/20 bg-white/10' : 'border-gray-200/50 bg-gray-200'}`}>
          <img 
            src={metadata.image} 
            alt={metadata.title || 'Link preview image'} 
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className={`p-2 flex flex-col justify-center min-w-0 flex-1 backdrop-blur-sm ${isMe ? 'bg-transparent text-white' : 'bg-white/50'}`}>
        <h4 className={`text-[12px] leading-tight font-bold line-clamp-2 mb-0.5 ${isMe ? 'text-white' : 'text-gray-800'}`}>
          {metadata.title || domain}
        </h4>
        {metadata.description && (
          <p className={`text-[10px] leading-snug line-clamp-2 mb-1 ${isMe ? 'text-indigo-100' : 'text-gray-500'}`}>
            {metadata.description}
          </p>
        )}
        <div className={`text-[9px] lowercase font-medium truncate ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
          {domain}
        </div>
      </div>
    </a>
  );
}
