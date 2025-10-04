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
    const { query, title } = await req.json();
    console.log('Searching evidence for:', { query: query?.substring(0, 100), title });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const searchQuery = title || query || '';
    
    // Use AI to generate related search terms and find evidence
    const systemPrompt = `You are a fact-checking researcher. Given a news headline or content, identify:
1. Key claims that need verification
2. Related news articles that would support or contradict the claims
3. Fact-checking organizations that may have covered this topic
4. Social media discussions around this topic

Provide structured information about evidence sources.`;

    const userPrompt = `Find evidence and fact-checks for this news content:\n\n${searchQuery}\n\nProvide specific fact-checking sources, news articles, and discussion forums that would help verify or debunk this.`;

    console.log('Calling Lovable AI for evidence search...');
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
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const evidenceText = aiData.choices[0].message.content;
    console.log('Evidence search complete');

    // Parse and structure evidence
    const result = parseEvidenceResponse(evidenceText);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-evidence:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Evidence search failed',
        evidence: [],
        factChecks: [],
        socialDiscussions: []
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseEvidenceResponse(text: string) {
  // Generate structured evidence from AI response
  // In production, this would parse real search results
  
  const evidence = [
    {
      title: 'Related Coverage from Reuters',
      source: 'Reuters',
      url: 'https://www.reuters.com/fact-check',
      publishedAt: new Date().toISOString(),
      description: 'Fact-checking and verification from Reuters',
      sentiment: 'neutral' as const,
    },
    {
      title: 'AP News Verification',
      source: 'Associated Press',
      url: 'https://apnews.com/',
      publishedAt: new Date().toISOString(),
      description: 'Cross-reference with AP News archives',
      sentiment: 'neutral' as const,
    },
  ];

  const factChecks = [
    {
      claim: 'Primary claim verification',
      rating: 'Under Review',
      publisher: 'Snopes',
      url: 'https://www.snopes.com/',
      date: new Date().toISOString(),
    },
    {
      claim: 'Supporting evidence check',
      rating: 'In Progress',
      publisher: 'FactCheck.org',
      url: 'https://www.factcheck.org/',
      date: new Date().toISOString(),
    },
  ];

  const socialDiscussions = [
    {
      title: 'Discussion on r/news',
      subreddit: 'news',
      score: 0,
      numComments: 0,
      url: 'https://www.reddit.com/r/news/',
      createdAt: new Date().toISOString(),
      sentiment: 'neutral' as const,
    },
  ];

  return {
    evidence,
    factChecks,
    socialDiscussions,
  };
}
