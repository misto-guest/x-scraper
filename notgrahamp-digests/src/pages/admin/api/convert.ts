import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
  const body = await context.request.json();
  const { content } = body;

  const apiKey = import.meta.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that converts tweet content into actionable items for project development. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: `Convert the following tweet into an actionable item for OpenClaw AI builder to improve our current project.

Tweet content: ${content}

Provide a JSON response with these exact fields:
{
  "title": "Clear, specific action item title",
  "description": "Detailed description of what to do",
  "priority": "high" or "medium" or "low",
  "category": "frontend/backend/integration/research/etc",
  "estimatedEffort": number (in hours),
  "dependencies": "any dependencies or empty string"
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to convert tweet' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    // Parse the JSON response
    let actionItem;
    try {
      // Try to parse directly
      actionItem = JSON.parse(generatedText);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = generatedText.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                       generatedText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        actionItem = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Could not parse AI response');
      }
    }

    return new Response(
      JSON.stringify(actionItem),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in action conversion:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
