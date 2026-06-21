#!/usr/bin/env node
/**
 * Push site to GitHub without system git (uses isomorphic-git).
 * Requires .env with GITHUB_USERNAME, GITHUB_TOKEN, GITHUB_REPO.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('Create .env from .env.example (GITHUB_USERNAME, GITHUB_TOKEN, GITHUB_REPO)');
  }
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    const val = trimmed.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const IGNORE = new Set([
  '.git',
  '.DS_Store',
  '.env',
  '.tools',
  'node_modules',
  'tanandthao-deploy.zip',
  'package-lock.json'
]);

function shouldIgnore(rel) {
  if (IGNORE.has(rel)) return true;
  if (rel.startsWith('.tools/')) return true;
  if (rel.startsWith('node_modules/')) return true;
  return false;
}

function walk(dir, base = dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(base, full).split(path.sep).join('/');
    if (shouldIgnore(rel)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full, base));
    else out.push(rel);
  }
  return out;
}

async function ensureRepo(username, repo, token) {
  const res = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tan-and-thao-deploy'
    }
  });
  if (res.status === 404) {
    const create = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'tan-and-thao-deploy'
      },
      body: JSON.stringify({
        name: repo,
        private: false,
        description: 'Tan & Thao wedding invitation site'
      })
    });
    if (!create.ok) {
      throw new Error(`Failed to create repo: ${create.status} ${await create.text()}`);
    }
    console.log(`Created https://github.com/${username}/${repo}`);
    return;
  }
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
  }
  console.log(`Repo exists: https://github.com/${username}/${repo}`);
}

async function main() {
  loadEnv();
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'tan-and-thao-2026';

  if (!username || !token) {
    throw new Error('Set GITHUB_USERNAME and GITHUB_TOKEN in .env');
  }

  await ensureRepo(username, repo, token);

  const gitDir = ROOT;
  const isRepo = fs.existsSync(path.join(gitDir, '.git'));
  if (!isRepo) {
    await git.init({ fs, dir: gitDir, defaultBranch: 'main' });
  }

  const files = walk(ROOT);
  for (const filepath of files) {
    await git.add({ fs, dir: gitDir, filepath });
  }

  const message = process.argv[2] || 'Update wedding site';
  const sha = await git.commit({
    fs,
    dir: gitDir,
    message,
    author: {
      name: username,
      email: `${username}@users.noreply.github.com`
    }
  });

  if (!sha) {
    console.log('Nothing to commit.');
    return;
  }

  console.log(`Committed: ${message}`);

  const url = `https://github.com/${username}/${repo}.git`;
  const remotes = await git.listRemotes({ fs, dir: gitDir });
  if (!remotes.find((r) => r.remote === 'origin')) {
    await git.addRemote({ fs, dir: gitDir, remote: 'origin', url });
  }

  await git.push({
    fs,
    http,
    dir: gitDir,
    remote: 'origin',
    ref: 'main',
    onAuth: () => ({ username, password: token })
  });

  console.log(`Pushed to https://github.com/${username}/${repo}`);
  console.log('Cloudflare Pages will auto-deploy if connected to this repo.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
