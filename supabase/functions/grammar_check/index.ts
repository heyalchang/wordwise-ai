import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface LanguageToolMatch {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: Array<{ value: string }>;
  rule: {
    id: string;
    category: { id: string; name: string };
  };
}

interface LanguageToolResponse {
  matches: LanguageToolMatch[];
}

// Offset mapping utilities for HTML to text conversion
function createOffsetMapping(html: string): {
  textToHtml: Map<number, number>;
} {
  const textToHtml = new Map<number, number>();
  let textIndex = 0;
  let inTag = false;

  for (let i = 0; i < html.length; i++) {
    const char = html[i];

    if (char === '<') {
      inTag = true;
    } else if (char === '>' && inTag) {
      inTag = false;
      continue;
    }

    if (!inTag) {
      textToHtml.set(textIndex, i);
      textIndex++;
    }
  }

  return { textToHtml };
}

function mapTextOffsetToHtml(
  textOffset: number,
  mapping: Map<number, number>
): number {
  return mapping.get(textOffset) ?? textOffset;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { docId, text, htmlText } = await req.json();

    if (!docId || !text) {
      return new Response(JSON.stringify({ error: 'Missing docId or text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create offset mapping if HTML text is provided
    let offsetMapping: Map<number, number> | null = null;
    if (htmlText) {
      const mapping = createOffsetMapping(htmlText);
      offsetMapping = mapping.textToHtml;
    }

    // Call LanguageTool API
    const languageToolUrl =
      Deno.env.get('LANGUAGETOOL_API_URL') ||
      'https://api.languagetool.org/v2/check';

    const formData = new FormData();
    formData.append('text', text);
    formData.append('language', 'en-US');
    formData.append('enabledOnly', 'false');

    const languageToolResponse = await fetch(languageToolUrl, {
      method: 'POST',
      body: formData,
    });

    if (!languageToolResponse.ok) {
      throw new Error(`LanguageTool API error: ${languageToolResponse.status}`);
    }

    const languageToolData: LanguageToolResponse =
      await languageToolResponse.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clear existing suggestions for this document
    await supabase.from('suggestions').delete().eq('doc_id', docId);

    // Transform LanguageTool matches to suggestions
    const suggestions = languageToolData.matches.map((match) => {
      // Map text offsets back to HTML offsets if mapping is available
      const htmlStart = offsetMapping
        ? mapTextOffsetToHtml(match.offset, offsetMapping)
        : match.offset;
      const htmlEnd = offsetMapping
        ? mapTextOffsetToHtml(match.offset + match.length, offsetMapping)
        : match.offset + match.length;

      return {
        doc_id: docId,
        start_pos: htmlStart,
        end_pos: htmlEnd,
        type: getSuggestionType(match.rule.category.id),
        message: match.message,
        replacements: match.replacements.map((r) => r.value),
      };
    });

    // Insert new suggestions
    if (suggestions.length > 0) {
      const { error } = await supabase.from('suggestions').insert(suggestions);

      if (error) {
        throw error;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        suggestions_count: suggestions.length,
        suggestions: suggestions,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Grammar check error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSuggestionType(categoryId: string): string {
  switch (categoryId) {
    case 'TYPOS':
    case 'TYPO':
      return 'spelling';
    case 'GRAMMAR':
      return 'grammar';
    case 'STYLE':
    case 'REDUNDANCY':
    case 'WORDINESS':
      return 'style';
    case 'PUNCTUATION':
      return 'punctuation';
    default:
      return 'grammar';
  }
}