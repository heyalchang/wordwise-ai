import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ReadabilityRequest {
  docId: string;
  text: string;
}

interface ReadabilityMetrics {
  flesch_score: number;
  passive_pct: number;
}

// Flesch Reading Ease Score calculation
function calculateFleschScore(text: string): number {
  if (!text.trim()) return 0;

  // Count sentences (periods, exclamation marks, question marks)
  const sentences = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;
  if (sentences === 0) return 0;

  // Count words (split by whitespace, filter empty)
  const words = text.split(/\s+/).filter((w) => w.trim().length > 0);
  const wordCount = words.length;
  if (wordCount === 0) return 0;

  // Count syllables in each word
  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllables(word);
  }

  // Flesch Reading Ease formula
  const avgSentenceLength = wordCount / sentences;
  const avgSyllablesPerWord = totalSyllables / wordCount;

  const fleschScore =
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;

  // Clamp between 0-100
  return Math.max(0, Math.min(100, Math.round(fleschScore * 10) / 10));
}

// Simple syllable counting algorithm
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length === 0) return 1;

  // Count vowel groups
  const vowels = 'aeiouy';
  let syllableCount = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }
    previousWasVowel = isVowel;
  }

  // Handle silent 'e' at the end
  if (word.endsWith('e') && syllableCount > 1) {
    syllableCount--;
  }

  // Every word has at least one syllable
  return Math.max(1, syllableCount);
}

// Passive voice detection
function calculatePassiveVoicePercentage(text: string): number {
  if (!text.trim()) return 0;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return 0;

  let passiveSentences = 0;

  for (const sentence of sentences) {
    if (isPassiveVoice(sentence.trim())) {
      passiveSentences++;
    }
  }

  return Math.round((passiveSentences / sentences.length) * 100 * 10) / 10;
}

// Simple passive voice detection
function isPassiveVoice(sentence: string): boolean {
  const words = sentence.toLowerCase().split(/\s+/);

  // Common "to be" verbs
  const beVerbs = ['is', 'are', 'was', 'were', 'been', 'being', 'be', 'am'];

  // Past participle patterns (simplified)
  const pastParticipleEndings = ['ed', 'en', 'n', 't'];

  // Check for "to be" + past participle pattern
  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i].replace(/[^a-z]/g, '');
    const nextWord = words[i + 1].replace(/[^a-z]/g, '');

    if (beVerbs.includes(currentWord)) {
      // Check if next word looks like a past participle
      if (
        pastParticipleEndings.some((ending) => nextWord.endsWith(ending)) &&
        nextWord.length > 3
      ) {
        // Additional check: avoid false positives with adjectives
        if (!isCommonAdjective(nextWord)) {
          return true;
        }
      }
    }
  }

  return false;
}

// Common adjectives that end in -ed to avoid false positives
function isCommonAdjective(word: string): boolean {
  const commonAdjectives = [
    'tired',
    'excited',
    'interested',
    'bored',
    'worried',
    'surprised',
    'confused',
    'amazed',
    'frustrated',
    'pleased',
    'concerned',
    'relaxed',
  ];
  return commonAdjectives.includes(word);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { docId, text }: ReadabilityRequest = await req.json();

    if (!docId || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing docId or invalid text' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate readability metrics
    const fleschScore = calculateFleschScore(text);
    const passivePct = calculatePassiveVoicePercentage(text);

    const readabilityMetrics: ReadabilityMetrics = {
      flesch_score: fleschScore,
      passive_pct: passivePct,
    };

    // Update document with readability metrics
    const { error: updateError } = await supabaseClient
      .from('documents')
      .update({
        readability: readabilityMetrics,
        updated_at: new Date().toISOString(),
      })
      .eq('id', docId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update document' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        readability: readabilityMetrics,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Readability function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
