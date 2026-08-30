import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for a small production Docker image.
  output: 'standalone',
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/logo.png',
      },
    ],
    // Our placeholder assets are SVG and all uploads are admin-only (trusted).
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (webpackConfig, { dev }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Uploads land in <cwd>/media (see Media collection). In dev the file
    // watcher would treat each upload as a source change, recompile, and
    // trigger Payload's hot-reload — which destroys the Mongo client and
    // breaks every subsequent request with MongoClientClosedError. Ignore the
    // upload dir so writing a file never restarts the server.
    if (dev) {
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: ['**/node_modules/**', '**/.git/**', '**/media/**'],
      }
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
