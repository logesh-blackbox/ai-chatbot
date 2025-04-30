
'use client';

import { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import { fetcher } from '@/lib/utils';

export function useChatSuggestions(input: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async (text: string) => {
    if (!text || text.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetcher(`/api/chat-suggestions?input=${encodeURIComponent(text)}`);
      setSuggestions(response || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  useEffect(() => {
    debouncedFetchSuggestions(input);
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [input]);

  return { suggestions, isLoading };
}
