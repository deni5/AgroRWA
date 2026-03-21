/** @type {import('next').NextConfig} */
module.exports = {
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
      path: false 
    };
    return config;
  },
};
