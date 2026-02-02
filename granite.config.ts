import { defineConfig } from '@apps-in-toss/web-framework';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 앱 이름과 동일해야 함
  appName: 'todays-coloring',

  brand: {
    displayName: '오늘의 컬러링',
    primaryColor: '#3182F6'
  },

  web: {
    host: 'localhost',
    port: 8080,
    commands: {
      dev: 'vite',
      build: 'vite build'
    }
  }
});
