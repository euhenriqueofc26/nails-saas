/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Imagens externas permitidas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Configurações de produção
  poweredByHeader: false,
  
  // Otimizações adicionales
  compress: true,
  
  // Gerar menos chunks
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
