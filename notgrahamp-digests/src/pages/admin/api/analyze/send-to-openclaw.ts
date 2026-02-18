import type { APIContext } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(context: APIContext) {
  try {
    const body = await context.request.json();
    const { title, category, relevance, summary, tweet, actionRequired, priority, estimatedEffort } = body;

    if (!title || !category || !tweet) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format the message for Dmitry
    const message = `🚀 *New Action from Tweet Analyzer*

*Title:* ${title}

*Category:* ${category}
*Relevance:* ${relevance}%
*Priority:* ${priority}
*Estimated Effort:* ${estimatedEffort}

*Summary:* ${summary}

*Tweet:*
- Author: ${tweet.author}
- Date: ${tweet.date}
- URL: ${tweet.url}
- Content: "${tweet.content}"

*Action Required:* ${actionRequired}

---

This action was auto-generated from the Tweet Analyzer. Review and implement as needed.`;

    // Send via openclaw sessions_send command
    // This sends to the main agent session (Dmitry)
    const openclawCmd = `openclaw sessions send --session "agent:dmitry:telegram:group:-1003847888515" --message "${message.replace(/"/g, '\\"')}"`;

    try {
      await execAsync(openclawCmd, {
        timeout: 10000,
        maxBuffer: 1024 * 1024
      });
    } catch (execError: any) {
      // Log error but don't fail - the message might still have been sent
      console.error('OpenClaw send command error:', execError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Action sent to OpenClaw successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending to OpenClaw:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send to OpenClaw: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
