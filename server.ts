import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3050;

// Simple static file server
Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Serve index.html for root path
    if (path === "/") {
      const indexPath = join(__dirname, "index.html");
      const file = Bun.file(indexPath);
      
      if (await file.exists()) {
        const html = await file.text();
        // Update script src to point to built file
        const updatedHtml = html
          .replace(
            '<script type="module" src="/src/main.tsx"></script>',
            '<script type="module" src="/dist/main.js"></script>'
          )
          .replace(
            '</head>',
            '<link rel="stylesheet" href="/dist/main.css"></head>'
          );
        
        return new Response(updatedHtml, {
          headers: { "Content-Type": "text/html" },
        });
      }
    }

    // Serve files from dist directory
    if (path.startsWith("/dist/")) {
      const filePath = join(__dirname, path);
      const file = Bun.file(filePath);
      
      if (await file.exists()) {
        const contentType = path.endsWith('.css') ? 'text/css' : 
                          path.endsWith('.js') ? 'application/javascript' :
                          'text/plain';
        return new Response(file, {
          headers: { "Content-Type": contentType },
        });
      }
    }

    // Serve static files from root
    const filePath = join(__dirname, path);
    const file = Bun.file(filePath);
    
    if (await file.exists()) {
      return new Response(file);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${PORT}`);