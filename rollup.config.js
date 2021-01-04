import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'word-cloud.js',
  output: {
    file: 'dist/word-cloud.js',
    format: 'cjs',
  },
  plugins: [resolve()],
};
