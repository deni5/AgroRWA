/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, os: false, path: false }
    return config
  },
}
