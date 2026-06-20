import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'

const API_PROXY_PATH = '/api'
const UPSTREAM_RESPONSE_HEADERS_TO_HIDE = [
  'host',
  'server',
  'via',
  'x-powered-by',
  'x-railway-edge',
  'x-railway-request-id',
  'x-request-id',
]

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function createApiProxy(
  targetUrl: string | undefined,
): Record<string, ProxyOptions> | undefined {
  if (!targetUrl) {
    return undefined
  }

  const target = targetUrl.trim().replace(/\/+$/, '')

  return {
    [API_PROXY_PATH]: {
      target,
      changeOrigin: true,
      secure: true,
      rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
      configure: (proxy) => {
        proxy.on('proxyRes', (proxyResponse) => {
          for (const header of UPSTREAM_RESPONSE_HEADERS_TO_HIDE) {
            delete proxyResponse.headers[header]
          }
        })
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxy = createApiProxy(env.API_URL)

  return {
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used - do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },
    ...(apiProxy
      ? {
          server: {
            proxy: apiProxy,
          },
          preview: {
            proxy: apiProxy,
          },
        }
      : {}),

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
