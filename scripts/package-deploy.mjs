#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const safeId = /^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/;
let temporary;
let pendingArchive;

function git(...args) {
  try {
    return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

async function copyWeb(source, target) {
  const stat = await fs.lstat(source);
  if (stat.isSymbolicLink()) throw new Error(`dist 不允许符号链接：${source}`);
  const name = path.basename(source);
  if (/^(?:node_modules|src|\.git|\.env(?:\..*)?|\.ssh)$/i.test(name)
      || /\.(?:pem|key|p12|pfx|map|vue|tsx?|jsx)$/i.test(name)
      || /^(?:id_rsa|id_ed25519|credentials(?:\..*)?)$/i.test(name)) {
    throw new Error(`dist 包含不应发布的文件或目录：${source}`);
  }
  if (stat.isDirectory()) {
    await fs.mkdir(target, { recursive: true, mode: 0o755 });
    for (const entry of await fs.readdir(source)) {
      if (entry === '.DS_Store') continue;
      await copyWeb(path.join(source, entry), path.join(target, entry));
    }
  } else if (stat.isFile()) {
    const data = await fs.readFile(source);
    if (/-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----/.test(data.toString('utf8'))) {
      throw new Error(`dist 包含私钥内容：${source}`);
    }
    await fs.writeFile(target, data, { mode: 0o644 });
  } else {
    throw new Error(`dist 仅允许普通文件和目录：${source}`);
  }
}

try {
  const builtAt = new Date().toISOString();
  const requestedId = process.env.RELEASE_ID;
  if (requestedId !== undefined && !safeId.test(requestedId)) {
    throw new Error('RELEASE_ID 必须为 1–96 位安全目录名：以字母或数字开头，仅含字母、数字、点、下划线、短横线。');
  }
  let siteUrl = null;
  if (process.env.SITE_URL !== undefined) {
    const url = new URL(process.env.SITE_URL);
    if (url.protocol !== 'https:' || url.username || url.password
        || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('SITE_URL 必须为不带凭据、路径、查询或片段的 HTTPS 站点根地址。');
    }
    siteUrl = url.origin;
  }
  let appVersion = null;
  try {
    appVersion = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')).version ?? null;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const commit = git('rev-parse', '--verify', 'HEAD');
  const status = commit ? git('status', '--porcelain') : null;
  const version = requestedId ?? `${builtAt.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}-${commit ? commit.slice(0, 12) : 'nogit'}-${randomBytes(3).toString('hex')}`;
  const dist = path.join(root, 'dist');
  if (!(await fs.lstat(dist)).isDirectory()) throw new Error('dist 必须为真实目录，请先执行 npm run build。');
  for (const required of ['index.html', '404.html']) {
    if (!(await fs.lstat(path.join(dist, required))).isFile()) throw new Error(`dist 缺少普通文件 ${required}`);
  }

  // 确认父目录存在，随后才创建 artifacts。
  if (!(await fs.stat(root)).isDirectory()) throw new Error('项目根目录不存在。');
  const artifacts = path.join(root, 'artifacts');
  await fs.mkdir(artifacts, { recursive: true });
  if ((await fs.lstat(artifacts)).isSymbolicLink()) throw new Error('artifacts 不允许符号链接。');
  const archive = path.join(artifacts, `suiworks-${version}.tar.gz`);
  temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'suiworks-package-'));
  await copyWeb(dist, path.join(temporary, 'web'));
  await fs.mkdir(path.join(temporary, 'nginx'));
  for (const name of ['http.conf', 'tls.conf', 'security-headers.conf']) {
    await fs.copyFile(path.join(root, 'deploy', 'nginx', name), path.join(temporary, 'nginx', name));
  }
  await fs.copyFile(path.join(root, 'deploy', 'README.md'), path.join(temporary, 'README.md'));
  const release = { version, appVersion, packagedAt: builtAt, siteUrl, git: { commit, dirty: status === null ? null : status.length > 0 } };
  await fs.writeFile(path.join(temporary, 'release.json'), `${JSON.stringify(release, null, 2)}\n`);
  pendingArchive = path.join(artifacts, `.suiworks-${version}-${randomBytes(6).toString('hex')}.tmp`);
  execFileSync('tar', ['-czf', pendingArchive, '-C', temporary, 'web', 'nginx', 'README.md', 'release.json'], {
    stdio: 'inherit', env: { ...process.env, COPYFILE_DISABLE: '1' },
  });
  // 硬链接以排他方式发布归档，已有同名版本绝不覆盖。
  await fs.link(pendingArchive, archive);
  console.log(`部署包：${archive}`);
  console.log(`版本：${version}；SITE_URL：${siteUrl ?? '未设置（生产发布前请设置并重新构建）'}`);
} catch (error) {
  console.error(`打包失败：${error.message}`);
  process.exitCode = 1;
} finally {
  if (pendingArchive) await fs.rm(pendingArchive, { force: true });
  if (temporary) await fs.rm(temporary, { recursive: true, force: true });
}
