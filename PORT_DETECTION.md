# Port Detection for Dev Runner

Dev Runner now supports automatic port detection when your dev server starts on a different port than expected.

## How it works

1. Dev Runner checks if your preferred port is available before starting your dev server
2. It sets the `PORT` environment variable with an available port
3. Your dev server writes the actual port it's using to a temporary file
4. Dev Runner polls this file to detect the actual port

## Integration Guide

### For Vite Projects

Add the Dev Runner plugin to your `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import { devRunnerPlugin } from '/Users/alchang/dev/dev-runner/dev-runner-port-writer.js';

export default defineConfig({
  plugins: [
    // ... your other plugins
    devRunnerPlugin()
  ],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  }
});
```

### For Create React App

Create React App automatically uses the `PORT` environment variable, but you need to add port detection:

1. Install `cross-env`: `npm install --save-dev cross-env`
2. Update your `package.json` start script:

```json
{
  "scripts": {
    "start": "cross-env PORT=$PORT react-scripts start && node /Users/alchang/dev/dev-runner/dev-runner-port-writer.js \"$npm_package_name\" $PORT"
  }
}
```

### For Next.js

Next.js uses the `PORT` environment variable by default. Add this to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p ${PORT:-3000} & sleep 2 && node /Users/alchang/dev/dev-runner/dev-runner-port-writer.js \"$npm_package_name\" ${PORT:-3000}"
  }
}
```

### For Custom Node.js Servers

In your server startup code:

```javascript
const { writePortToFile } = require('/Users/alchang/dev/dev-runner/dev-runner-port-writer.js');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  writePortToFile(port);
});
```

### For Other Frameworks

If your framework doesn't support plugins or hooks, you can manually call the port writer:

```bash
# In your start script
your-dev-server --port $PORT && node /Users/alchang/dev/dev-runner/dev-runner-port-writer.js "your-project-name" $PORT
```

## Troubleshooting

- Make sure the Dev Runner app has permission to read/write to the temp directory
- The port file is automatically cleaned up when your dev server stops
- Check the console logs for any error messages about port detection