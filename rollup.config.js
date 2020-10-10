import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import postcss from "rollup-plugin-postcss";
import ascii from "rollup-plugin-ascii";
import resolve from "@rollup/plugin-node-resolve";
import includePaths from "rollup-plugin-includepaths";
import jsx from 'acorn-jsx';
import typescript from '@rollup/plugin-typescript';

const externalAry = [
  "react",
  "immutable",
  "react-hooks-redux"
];

export default {
  input: "mihux/index.tsx",
  output: {
    // file: "dist/index.d.ts",
    format: "esm",
    sourcemap: true,
    dir: "./dist",
  },
  acornInjectPlugins: [jsx()],
  plugins: [
    resolve(),
    typescript({ 
      jsx: 'react'
    }),
    /* includePaths({
      include: { "@mihux": "./mihux/index.tsx" },
    }), */
    babel({ exclude: "**/node_modules/**", runtimeHelpers: true }),
    commonjs(),
    ascii(),
    postcss({
      // Extract CSS to the same location where JS file is generated but with .css extension.
      extract: true,
      // Use named exports alongside default export.
      namedExports: true,
      // Minimize CSS, boolean or options for cssnano.
      minimize: true,
      // Enable sourceMap.
      sourceMap: true,
      // This plugin will process files ending with these extensions and the extensions supported by custom loaders.
      extensions: [".less",".scss", ".css"],
    }),
    // terser(),
  ],
  //不能使用正则匹配，有定制化组件也是以echarts命名
  external: externalAry,
};
