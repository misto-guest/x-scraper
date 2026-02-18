import type { APIContext } from 'astro';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  calculateRelevance
} from '../../../../lib/admin-utils';

export async function GET(context: APIContext) {
  try {
    const projects = getProjects();
    return new Response(
      JSON.stringify({ projects }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(context: APIContext) {
  try {
    const body = await context.request.json();
    const { name, keywords, relevanceThreshold, description, actionTemplate } = body;

    if (!name || !keywords || !Array.isArray(keywords) || relevanceThreshold === undefined || !description || !actionTemplate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const project = createProject({
      name,
      keywords,
      relevanceThreshold,
      description,
      actionTemplate
    });

    return new Response(
      JSON.stringify({ project }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT(context: APIContext) {
  try {
    const body = await context.request.json();
    const { name, keywords, relevanceThreshold, description, actionTemplate } = body;

    if (!name || !keywords || !Array.isArray(keywords) || relevanceThreshold === undefined || !description || !actionTemplate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(context.request.url);
    const id = url.pathname.split('/').pop();

    const updated = updateProject(id!, {
      name,
      keywords,
      relevanceThreshold,
      description,
      actionTemplate
    });

    if (!updated) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ project: updated }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(context: APIContext) {
  try {
    const url = new URL(context.request.url);
    const id = url.pathname.split('/').pop();

    const success = deleteProject(id!);

    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
