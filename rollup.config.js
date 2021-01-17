import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
  input: 'main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  },
  external: ['obsidian'],
  plugins: [
    typescript(),
    nodeResolve({browser: true}),
    commonjs(),
    copy({
      targets: [
        {src: 'main.js', dest: '../semantic-obsidian/Semantic Obsidian/.obsidian/plugins/search-on-internet'},
        {src: 'manifest.json', dest: '../semantic-obsidian/Semantic Obsidian/.obsidian/plugins/search-on-internet'},
      ],
      hook: 'writeBundle',
    }),
  ]
};