import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useDebouncedValue } from './useDebounce';

export function useReadabilityCheck(
  documentId: string | null,
  content: string
) {
  // Debounce content changes to avoid excessive API calls
  const debouncedContent = useDebouncedValue(content, 3000); // 3 second delay for readability

  const checkReadability = useCallback(
    async (text: string) => {
      if (!documentId || !text.trim() || text.length < 50) {
        return; // Skip readability check for very short content
      }

      try {
        const { data, error } = await supabase.functions.invoke('readability', {
          body: {
            docId: documentId,
            text: text,
          },
        });

        if (error) {
          console.error('Readability check error:', error);
          return;
        }

        if (data?.success && data?.readability) {
          // The readability metrics are automatically saved to the database
          // by the Edge Function, so we don't need to do anything else here
          console.log('Readability updated:', data.readability);
        }
      } catch (error) {
        console.error('Failed to check readability:', error);
      }
    },
    [documentId]
  );

  // Trigger readability check when debounced content changes
  useEffect(() => {
    if (debouncedContent) {
      checkReadability(debouncedContent);
    }
  }, [debouncedContent, checkReadability]);

  // Return the check function for manual triggers if needed
  return { checkReadability };
}
