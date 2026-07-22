import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['node_modules/**', '.next/**', 'tools/**', 'data/**'],
  },
];

export default eslintConfig;
