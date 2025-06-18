import type { Suggestion } from '../lib/supabase';

interface SuggestionListProps {
  suggestions: Suggestion[];
  onSuggestionClick: (suggestion: Suggestion) => void;
  className?: string;
}

export function SuggestionList({
  suggestions,
  onSuggestionClick,
  className = '',
}: SuggestionListProps) {
  const getTypeStyling = (type: string) => {
    switch (type) {
      case 'grammar':
        return { icon: '⚠️', color: 'border-red-400', bg: 'hover:bg-red-50' };
      case 'spelling':
        return {
          icon: '📝',
          color: 'border-yellow-400',
          bg: 'hover:bg-yellow-50',
        };
      case 'style':
        return {
          icon: '✨',
          color: 'border-blue-400',
          bg: 'hover:bg-blue-50',
        };
      case 'punctuation':
        return {
          icon: '💬',
          color: 'border-purple-400',
          bg: 'hover:bg-purple-50',
        };
      default:
        return {
          icon: '💡',
          color: 'border-gray-400',
          bg: 'hover:bg-gray-100',
        };
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Suggestions ({suggestions.length})
      </h3>
      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No suggestions found.</p>
          <p className="text-xs text-gray-400 mt-1">Great work!</p>
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto space-y-2 -mr-2 pr-2">
          {suggestions.map((suggestion) => {
            const { icon, color, bg } = getTypeStyling(suggestion.type);
            return (
              <li key={suggestion.id}>
                <button
                  onClick={() => onSuggestionClick(suggestion)}
                  className={`w-full text-left p-3 rounded-md border-l-4 transition-colors ${color} ${bg}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="mt-0.5 text-lg">{icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 leading-snug">
                        {suggestion.message}
                      </p>
                      {suggestion.replacements.length > 0 && (
                        <p className="text-sm text-green-700 font-semibold mt-1.5">
                          → "{suggestion.replacements[0]}"
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}