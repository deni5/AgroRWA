/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 ГОЛОВНЕ ВИПРАВЛЕННЯ ДЛЯ VERCEL: 
  // Змушує Next.js компілювати ці пакети, навіть якщо вони лежать у кореневому node_modules
  transpilePackages: [
    '@tanstack/react-query',
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui'
  ],

  // Дозволяємо білд навіть із помилками TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Дозволяємо білд навіть із попередженнями ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  webpack: (config) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback, 
      fs: false, 
      os: false, 
      path: false,
      crypto: false // Додав crypto, бо Solana web3 часто його вимагає
    };
    return config;
  },
};

module.exports = nextConfig;
