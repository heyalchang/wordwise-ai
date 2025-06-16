import type { Document } from '../lib/supabase';

interface ReadabilityMeterProps {
  document: Document | null;
  className?: string;
}

interface ReadabilityLevel {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

// Flesch Reading Ease Score interpretation
function getReadabilityLevel(score: number): ReadabilityLevel {
  if (score >= 90) {
    return {
      label: 'Very Easy',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      description: '5th grade level',
    };
  } else if (score >= 80) {
    return {
      label: 'Easy',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: '6th grade level',
    };
  } else if (score >= 70) {
    return {
      label: 'Fairly Easy',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: '7th grade level',
    };
  } else if (score >= 60) {
    return {
      label: 'Standard',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      description: '8th-9th grade',
    };
  } else if (score >= 50) {
    return {
      label: 'Fairly Difficult',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      description: '10th-12th grade',
    };
  } else if (score >= 30) {
    return {
      label: 'Difficult',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      description: 'College level',
    };
  } else {
    return {
      label: 'Very Difficult',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      description: 'Graduate level',
    };
  }
}

function getPassiveVoiceLevel(percentage: number): {
  color: string;
  description: string;
} {
  if (percentage <= 10) {
    return { color: 'text-green-600', description: 'Excellent' };
  } else if (percentage <= 20) {
    return { color: 'text-blue-600', description: 'Good' };
  } else if (percentage <= 30) {
    return { color: 'text-yellow-600', description: 'Fair' };
  } else {
    return { color: 'text-red-600', description: 'High' };
  }
}

export function ReadabilityMeter({
  document,
  className = '',
}: ReadabilityMeterProps) {
  const readability = document?.readability;
  const fleschScore = readability?.flesch_score ?? 0;
  const passivePercentage = readability?.passive_pct ?? 0;

  const readabilityLevel = getReadabilityLevel(fleschScore);
  const passiveLevel = getPassiveVoiceLevel(passivePercentage);

  if (!document || !readability) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Readability Analysis
        </h3>
        <p className="text-sm text-gray-500">
          Start writing to see readability metrics...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Readability Analysis
      </h3>

      {/* Flesch Reading Ease Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Reading Ease</span>
          <span className="text-sm font-medium text-gray-900">
            {fleschScore}/100
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full ${
              fleschScore >= 70
                ? 'bg-green-500'
                : fleschScore >= 50
                  ? 'bg-blue-500'
                  : fleschScore >= 30
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(5, fleschScore)}%` }}
          />
        </div>

        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${readabilityLevel.bgColor} ${readabilityLevel.color}`}
        >
          {readabilityLevel.label} • {readabilityLevel.description}
        </div>
      </div>

      {/* Passive Voice Percentage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Passive Voice</span>
          <span className="text-sm font-medium text-gray-900">
            {passivePercentage}%
          </span>
        </div>

        {/* Progress bar (inverted - lower is better) */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full ${
              passivePercentage <= 10
                ? 'bg-green-500'
                : passivePercentage <= 20
                  ? 'bg-blue-500'
                  : passivePercentage <= 30
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
            }`}
            style={{
              width: `${Math.min(100, Math.max(5, passivePercentage))}%`,
            }}
          />
        </div>

        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${passiveLevel.color}`}
        >
          {passiveLevel.description}
        </div>
      </div>

      {/* ESL-friendly tips */}
      <div className="border-t border-gray-200 pt-3">
        <h4 className="text-xs font-medium text-gray-700 mb-2">
          Tips for ESL Writers
        </h4>
        <div className="space-y-1">
          {fleschScore < 60 && (
            <p className="text-xs text-gray-600">
              • Try using shorter sentences for better clarity
            </p>
          )}
          {passivePercentage > 20 && (
            <p className="text-xs text-gray-600">
              • Use active voice more often (e.g., "I wrote" instead of "It was
              written")
            </p>
          )}
          {fleschScore >= 70 && passivePercentage <= 15 && (
            <p className="text-xs text-green-600">
              • Great job! Your writing is clear and easy to read
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
