import { useState, useEffect } from 'react';

export function useSelectedTag() {
  const [selectedTag, setSelectedTag] = useState<string | null>(getInitialTag());

  function getInitialTag(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('tag');

  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const currentTag = url.searchParams.get('tag');
    
    if (selectedTag && selectedTag !== currentTag) {
      url.searchParams.set('tag', selectedTag);
      url.searchParams.delete('folder'); // Clear folder when selecting tag
      window.history.pushState({ type: 'tag', id: selectedTag }, '', url.toString());
    } else if (!selectedTag && currentTag) {
      url.searchParams.delete('tag');
      window.history.pushState({ type: 'tag', id: null }, '', url.toString());
    }
  }, [selectedTag]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const tagParam = params.get('tag');
      
      if ((!event.state || event.state.type === 'tag') && tagParam !== selectedTag) {
        setSelectedTag(tagParam);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedTag]);

  return {
    selectedTag,
    setSelectedTag,
  };
}