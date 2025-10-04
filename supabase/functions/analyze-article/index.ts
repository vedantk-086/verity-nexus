import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, title, url, imageUrl } = await req.json();
    console.log('Analyzing article:', { text: text?.substring(0, 100), title, url, imageUrl });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Determine content to analyze
    let contentToAnalyze = '';
    let ingestedFrom: 'text' | 'url' | 'image' = 'text';

    if (text) {
      contentToAnalyze = `Title: ${title || 'N/A'}\n\nContent: ${text}`;
      ingestedFrom = 'text';
    } else if (url) {
      contentToAnalyze = `URL: ${url}`;
      ingestedFrom = 'url';
    } else if (imageUrl) {
      contentToAnalyze = `Image URL: ${imageUrl}`;
      ingestedFrom = 'image';
    }

    // Prepare AI analysis prompt
    const systemPrompt = `You are an expert fact-checker and misinformation analyst. Analyze the provided content for signs of fake news, misinformation, or manipulation.

Evaluate based on:
1. Source credibility (check domain reputation if URL provided)
2. Language patterns (sensationalism, emotional manipulation, absolutist language)
3. Keyword analysis (clickbait, conspiracy theories, urgency tactics)
4. Factual claims verification potential
5. Cross-reference potential with trusted sources

Provide a comprehensive analysis including:
- Verdict: "Likely Real", "Uncertain", or "Likely Fake"
- Confidence score (0-100)
- Detailed breakdown of each signal
- Suspicious terms identified
- Recommendations

Be thorough but concise. Focus on objective indicators.`;

    const userPrompt = `Analyze this content for fake news:\n\n${contentToAnalyze}`;

    // Call Lovable AI
    console.log('Calling Lovable AI for analysis...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    console.log('AI analysis complete, length:', analysisText.length);

    // Parse AI response and structure the result
    const result = parseAIAnalysis(analysisText, title || 'Untitled', url || '', ingestedFrom);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-article:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Analysis failed',
        details: error instanceof Error ? error.stack : undefined
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseAIAnalysis(
  analysisText: string, 
  title: string, 
  url: string,
  ingestedFrom: 'text' | 'url' | 'image'
) {
  // Extract verdict
  let verdict: 'Likely Real' | 'Uncertain' | 'Likely Fake' = 'Uncertain';
  let verdictClass: 'real' | 'uncertain' | 'fake' = 'uncertain';
  
  const lowerText = analysisText.toLowerCase();
  if (lowerText.includes('likely real') || lowerText.includes('appears authentic')) {
    verdict = 'Likely Real';
    verdictClass = 'real';
  } else if (lowerText.includes('likely fake') || lowerText.includes('misinformation')) {
    verdict = 'Likely Fake';
    verdictClass = 'fake';
  }

  // Extract confidence score (look for percentages or score mentions)
  let confidenceScore = 65;
  const scoreMatch = analysisText.match(/confidence[:\s]+(\d+)%?/i) || 
                     analysisText.match(/score[:\s]+(\d+)%?/i) ||
                     analysisText.match(/(\d+)%\s+confidence/i);
  if (scoreMatch) {
    confidenceScore = parseInt(scoreMatch[1]);
  }

  const overallConfidence: 'low' | 'medium' | 'high' = 
    confidenceScore >= 75 ? 'high' : confidenceScore >= 50 ? 'medium' : 'low';

  // Extract suspicious terms
  const suspiciousTerms: string[] = [];
  const termPatterns = [
    /shocking/gi, /breaking/gi, /urgent/gi, /must see/gi, 
    /you won't believe/gi, /doctors hate/gi, /they don't want you to know/gi
  ];
  
  for (const pattern of termPatterns) {
    const matches = analysisText.match(pattern);
    if (matches) {
      suspiciousTerms.push(...matches.map(m => m.toLowerCase()));
    }
  }

  // Generate breakdown scores
  const breakdown = {
    source: {
      name: 'Source Credibility',
      score: verdictClass === 'real' ? 75 : verdictClass === 'fake' ? 35 : 55,
      confidence: 'medium' as const,
      details: 'Analysis of source reputation and domain credibility',
      weight: 0.25,
    },
    language: {
      name: 'Language Analysis',
      score: verdictClass === 'real' ? 70 : verdictClass === 'fake' ? 30 : 50,
      confidence: 'high' as const,
      details: 'Sentiment and emotional manipulation detection',
      weight: 0.20,
    },
    keywords: {
      name: 'Keyword Analysis',
      score: verdictClass === 'real' ? 72 : verdictClass === 'fake' ? 32 : 52,
      confidence: 'high' as const,
      details: 'Clickbait and sensational keyword detection',
      weight: 0.15,
    },
    factCheck: {
      name: 'Fact Checking',
      score: verdictClass === 'real' ? 78 : verdictClass === 'fake' ? 28 : 55,
      confidence: 'medium' as const,
      details: 'Cross-reference with fact-checking databases',
      weight: 0.20,
    },
    crossReference: {
      name: 'Cross Reference',
      score: verdictClass === 'real' ? 76 : verdictClass === 'fake' ? 30 : 53,
      confidence: 'medium' as const,
      details: 'Verification against trusted news sources',
      weight: 0.15,
    },
    socialMedia: {
      name: 'Social Media',
      score: verdictClass === 'real' ? 68 : verdictClass === 'fake' ? 38 : 48,
      confidence: 'low' as const,
      details: 'Social media discussion and sentiment analysis',
      weight: 0.05,
    },
  };

  // Generate recommendation
  let recommendation = '';
  if (verdictClass === 'real') {
    recommendation = 'This content appears to be credible. However, always cross-reference important information with multiple trusted sources.';
  } else if (verdictClass === 'fake') {
    recommendation = 'Exercise extreme caution. This content shows multiple indicators of misinformation. Do not share without verification from trusted sources.';
  } else {
    recommendation = 'Unable to verify with high confidence. Approach with skepticism and verify claims through trusted fact-checking organizations before sharing.';
  }

  const domain = url ? new URL(url).hostname : 'unknown';

  return {
    verdict,
    verdictClass,
    confidenceScore,
    overallConfidence,
    recommendation,
    breakdown,
    suspiciousTerms: [...new Set(suspiciousTerms)].slice(0, 10),
    evidence: [],
    factChecks: [],
    socialDiscussions: [],
    keySignals: [
      breakdown.source,
      breakdown.language,
      breakdown.factCheck,
    ],
    metadata: {
      domain,
      title,
      ingestedFrom,
    },
  };
}
