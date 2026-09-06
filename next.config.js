/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/customer", destination: "/user", permanent: true },
      { source: "/customer/:path*", destination: "/user/:path*", permanent: true },
      { source: "/worker", destination: "/partner", permanent: true },
      { source: "/worker/:path*", destination: "/partner/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
