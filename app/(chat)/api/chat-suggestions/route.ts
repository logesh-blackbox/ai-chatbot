
import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { streamObject } from 'ai';
import { z } from 'zod';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');

  if (!input) {
    return Response.json([], { status: 200 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { elementStream } = streamObject({
      model: myProvider.languageModel('chat-model'),
      system: 'You are a helpful chat assistant. Given a partial message, suggest possible completions.',
      prompt: input,
      output: 'array',
      schema: z.object({
        suggestion: z.string().describe('A possible completion for the message'),
      }),
      maxTokens: 50,
    });

    const suggestions = [];
    for await (const element of elementStream) {
      suggestions.push(element.suggestion);
      if (suggestions.length >= 3) break; // Limit to 3 suggestions
    }

    return Response.json(suggestions, { status: 200 });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return Response.json([], { status: 200 });
  }
}
