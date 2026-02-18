import type { APIContext } from 'astro';
import {
  getProjects,
  getOpenClawCategories,
  calculateRelevance
} from '../../../../lib/admin-utils';

export async function POST(context: APIContext) {
  try {
    const body = await context.request.json();
    const { text } = body;

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const projects = getProjects();
    const categories = getOpenClawCategories();
    const results: any = {
      projects: [],
      category: null
    };

    // Test projects
    projects.forEach(project => {
      const score = calculateRelevance(text, project.keywords);
      if (score >= project.relevanceThreshold) {
        const matches = project.keywords.filter(kw =>
          text.toLowerCase().includes(kw.toLowerCase())
        );
        results.projects.push({
          project: {
            id: project.id,
            name: project.name,
            relevanceThreshold: project.relevanceThreshold
          },
          score,
          matches
        });
      }
    });

    // Sort projects by score
    results.projects.sort((a: any, b: any) => b.score - a.score);

    // Test OpenClaw categories
    let bestCategory: any = null;
    let highestScore = 0;

    categories.forEach(category => {
      const score = calculateRelevance(text, category.keywords);
      if (score > highestScore && score >= 30) {
        highestScore = score;
        const matches = category.keywords.filter(kw =>
          text.toLowerCase().includes(kw.toLowerCase())
        );
        bestCategory = {
          name: category.name,
          id: category.id,
          score,
          matches
        };
      }
    });

    if (bestCategory) {
      results.category = bestCategory;
    }

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
