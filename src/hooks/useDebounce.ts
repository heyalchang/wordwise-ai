import { useEffect, useRef } from 'react';

export function useDebounce<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };
}

export function useAutosave(
  documentId: string | null,
  content: string,
  saveCallback: (id: string, content: string) => Promise<void>,
  delay = 1000
) {
  const debouncedSave = useDebounce((id: string, content: string) => {
    saveCallback(id, content);
  }, delay);

  useEffect(() => {
    if (documentId && content) {
      debouncedSave(documentId, content);
    }
  }, [documentId, content, debouncedSave]);
}
