import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useDebounce } from './useDebounce';

interface GrammarCheckHookProps {
  documentId: string;
  onSuggestionsUpdate?: (suggestions: any[]) => void;
}

export function useGrammarCheck({ documentId, onSuggestionsUpdate }: GrammarCheckHookProps) {
  const checkGrammar = useCallback(async (text: string) => {
    if (!text || text.length < 10) return; // Skip very short text

    try {
      const { data, error } = await supabase.functions.invoke('grammar_check', {
        body: {
          docId: documentId,
          text: text.replace(/<[^>]*>/g, ''), // Strip HTML tags for LanguageTool
        },
      });

      if (error) {
        console.error('Grammar check error:', error);
        return;
      }

      if (onSuggestionsUpdate && data?.suggestions) {
        onSuggestionsUpdate(data.suggestions);
      }
    } catch (error) {
      console.error('Grammar check failed:', error);
    }
  }, [documentId, onSuggestionsUpdate]);

  // Debounce grammar checking to avoid excessive API calls
  const debouncedGrammarCheck = useDebounce(checkGrammar, 2000);

  return {
    checkGrammar: debouncedGrammarCheck,
  };
}