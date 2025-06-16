import { useRef, useEffect } from 'react';

interface Suggestion {
  id: number;
  doc_id: string;
  start_pos: number;
  end_pos: number;
  type: string;
  message: string;
  replacements: string[];
}

interface SuggestionPopoverProps {
  suggestion: Suggestion;
  onApply: (suggestionId: number, replacement: string) => void;
  onDismiss: (suggestionId: number) => void;
  position: { x: number; y: number };
  onClose: () => void;
}

export function SuggestionPopover({
  suggestion,
  onApply,
  onDismiss,
  position,
  onClose,
}: SuggestionPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleApply = async (replacement: string) => {
    await onApply(suggestion.id, replacement);
    onClose();
  };

  const handleDismiss = async () => {
    await onDismiss(suggestion.id);
    onClose();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grammar':
        return 'border-red-200 bg-red-50';
      case 'spelling':
        return 'border-yellow-200 bg-yellow-50';
      case 'style':
        return 'border-blue-200 bg-blue-50';
      case 'punctuation':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grammar':
        return '⚠️';
      case 'spelling':
        return '📝';
      case 'style':
        return '✨';
      case 'punctuation':
        return '💬';
      default:
        return '💡';
    }
  };

  return (
    <div
      ref={popoverRef}
      className={`absolute z-50 w-80 p-4 border rounded-lg shadow-lg ${getTypeColor(
        suggestion.type
      )}`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateY(-100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
          <span className="text-sm font-medium text-gray-700 capitalize">
            {suggestion.type}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-800 mb-4">{suggestion.message}</p>

      {/* Replacements */}
      {suggestion.replacements && suggestion.replacements.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Suggestions:</p>
          <div className="space-y-1">
            {suggestion.replacements.slice(0, 3).map((replacement, index) => (
              <button
                key={index}
                onClick={() => handleApply(replacement)}
                className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                "{replacement}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between space-x-2">
        <button
          onClick={handleDismiss}
          className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-white transition-colors"
        >
          Ignore
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
