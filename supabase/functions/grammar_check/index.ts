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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { docId, text } = await req.json();

    if (!docId || !text) {
      return new Response(JSON.stringify({ error: 'Missing docId or text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
    const suggestions = languageToolData.matches.map((match) => ({
      doc_id: docId,
      start_pos: match.offset,
      end_pos: match.offset + match.length,
      type: getSuggestionType(match.rule.category.id),
      message: match.message,
      replacements: match.replacements.map((r) => r.value),
    }));

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
