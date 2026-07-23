/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: {
    //removeConsole: process.env.NODE_ENV === "production",
    removeConsole: false,
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/main",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
