import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import preserveDirectories from 'rollup-preserve-directives';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function getEntryPoints(dir) {
  const entries = [];
  
  const traverse = (dir) => {
    const files = readdirSync(dir);
    files.forEach((file) => {
      const fullPath = join(dir, file);
      if (statSync(fullPath).isDirectory()) {
        traverse(fullPath);
      } else if (file === 'index.ts') {
        entries.push(fullPath);
      }
    });
  };

  traverse(dir);

  return entries;
}

const config = {
  input: getEntryPoints('src'),
  output: [
    {
      dir: 'dist',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: (chunkInfo) => {
        const parts = chunkInfo.name.split('/');
        parts[0] = parts[0].toLowerCase();
        return parts.join('/') + '.mjs';
      },
    },
    {
      dir: 'dist',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: (chunkInfo) => {
        const parts = chunkInfo.name.split('/');
        parts[0] = parts[0].toLowerCase();
        return parts.join('/') + '.cjs';
      },
    }
  ],
  plugins: [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
    }),
    preserveDirectories(),
  ],
  external: ['react'],
};

export default config;
