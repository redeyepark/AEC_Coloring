import { createWriteStream } from 'fs';
import { readFile } from 'fs/promises';
import archiver from 'archiver';

const distDir = './dist';
const outputFile = './dailycoloring.ait';

async function createAit() {
  // package.json 읽기
  const packageJson = JSON.parse(await readFile('./package.json', 'utf-8'));

  // app.json 생성 (Toss Apps-in-Toss 형식)
  const appJson = {
    appName: 'dailycoloring',
    version: packageJson.version,
    permissions: [],
    _metadata: {
      runtimeVersion: '0.72.6',
      bundleFiles: [],
      deploymentId: '019c27f8-fb55-7509-8bdb-157e6111fe4a',
      packageJson: {
        name: packageJson.name,
        version: packageJson.version,
        dependencies: packageJson.dependencies
      }
    }
  };

  const output = createWriteStream(outputFile);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`✅ ${outputFile} 생성 완료 (${archive.pointer()} bytes)`);
    console.log('📦 번들 구조:');
    console.log('   ├── app.json');
    console.log('   └── web/');
    console.log('       ├── index.html');
    console.log('       └── static/');
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // app.json을 루트에 추가
  archive.append(JSON.stringify(appJson), { name: 'app.json' });

  // dist 폴더 내용을 web/ 폴더로 추가
  archive.directory(distDir, 'web');

  await archive.finalize();
}

createAit().catch(console.error);
