import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'dailycoloring',
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'rsbuild dev',
      build: 'rsbuild build',
    },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '오늘의 컬러링',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/icons/png/4x/icon-toss-logo.png',
  },
});
