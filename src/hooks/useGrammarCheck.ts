import { useCallback, useEffect } from 'react';
import { supabase, type Suggestion } from '../lib/supabase';
import { useDebounce } from './useDebounce';
import { getEditorTextAndMapping } from '../utils/offsetMapping';

interface GrammarCheckHookProps {
  documentId: string;
  onSuggestionsUpdate?: (suggestions: Suggestion[]) => void;
}

export function useGrammarCheck({
  documentId,
  onSuggestionsUpdate,
}: GrammarCheckHookProps) {
  const checkGrammar = useCallback(
    async (htmlText: string) => {
      if (!htmlText || htmlText.length < 10) return; // Skip very short text

      try {
        // Get plain text and offset mapping
        const { plainText } = getEditorTextAndMapping(htmlText);

        const { data, error } = await supabase.functions.invoke(
          'grammar_check',
          {
            body: {
              docId: documentId,
              text: plainText, // Send plain text to LanguageTool
              htmlText, // Also send HTML for server-side mapping if needed
            },
          }
        );

        if (error) {
          console.error('Grammar check error:', error);
          return;
        }

        // The Edge Function now handles offset mapping on the server side
        // so suggestions should already have correct HTML offsets
        if (onSuggestionsUpdate && data?.suggestions) {
          onSuggestionsUpdate(data.suggestions);
        }
      } catch (error) {
        console.error('Grammar check failed:', error);
      }
    },
    [documentId, onSuggestionsUpdate]
  );

  // Subscribe to realtime suggestions updates
  useEffect(() => {
    if (!documentId) return;

    // Load existing suggestions
    const loadSuggestions = async () => {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('doc_id', documentId)
        .order('start', { ascending: true });

      if (!error && data && onSuggestionsUpdate) {
        onSuggestionsUpdate(data);
      }
    };

    loadSuggestions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`suggestions:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suggestions',
          filter: `doc_id=eq.${documentId}`,
        },
        () => {
          // Reload suggestions when there's any change
          loadSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, onSuggestionsUpdate]);

  // Debounce grammar checking to avoid excessive API calls
  const debouncedGrammarCheck = useDebounce(checkGrammar, 2000);

  return {
    checkGrammar: debouncedGrammarCheck,
  };
}