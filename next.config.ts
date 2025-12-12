import type { NextConfig } from 'next';
import createNextIntPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
};

const withNextIntl = createNextIntPlugin();
export default withNextIntl(nextConfig);
