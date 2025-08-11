// Cloudflare Pages Functions for handling MIME types
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Handle JavaScript files
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.mjs')) {
    const response = await context.next();
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Content-Type', 'application/javascript; charset=utf-8');
    return newResponse;
  }
  
  // Handle CSS files
  if (url.pathname.endsWith('.css')) {
    const response = await context.next();
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Content-Type', 'text/css; charset=utf-8');
    return newResponse;
  }
  
  // Default handling
  return await context.next();
}
