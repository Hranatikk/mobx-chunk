import typescript from 'rollup-plugin-typescript2'
import terser from '@rollup/plugin-terser'

const pkg = require('./package.json')

export default [
  // ES module
  {
    input: 'src/index.ts',
    external: [...Object.keys(pkg.peerDependencies || {}), 'react', 'mobx'],
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript({ useTsconfigDeclarationDir: true }),
      terser()
    ]
  },
  // CommonJS
  {
    input: 'src/index.ts',
    external: [...Object.keys(pkg.peerDependencies || {}), 'react', 'mobx'],
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      typescript(),
      terser()
    ]
  }
]
