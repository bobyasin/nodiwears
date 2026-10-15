import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { siteConfig } from './data/site';

const root = resolve(__dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('wrangler configuration', () => {
  const config = JSON.parse(read('wrangler.jsonc')) as {
    name: string;
    compatibility_date: string;
    routes: { pattern: string; custom_domain?: boolean }[];
    assets: { directory: string; not_found_handling: string };
  };

  it('should publish the Astro build output as static assets', () => {
    expect(config.assets.directory).toBe('./dist');
  });

  it('should serve the custom 404 page for unknown paths', () => {
    expect(config.assets.not_found_handling).toBe('404-page');
    expect(existsSync(resolve(root, 'src/pages/404.astro'))).toBe(true);
  });

  it('should pin a valid compatibility date', () => {
    expect(config.compatibility_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should attach the production host as a custom domain', () => {
    const host = new URL(siteConfig.url).hostname;

    expect(config.routes).toContainEqual({ pattern: host, custom_domain: true });
  });

  it('should keep the apex domain attached so it can redirect to the production host', () => {
    const apex = new URL(siteConfig.url).hostname.replace(/^www\./, '');

    expect(config.routes).toContainEqual({ pattern: apex, custom_domain: true });
  });

  it('should only declare custom domains on the production domain', () => {
    const host = new URL(siteConfig.url).hostname;
    const apex = host.replace(/^www\./, '');

    for (const route of config.routes) {
      expect(route.custom_domain).toBe(true);
      expect([host, apex]).toContain(route.pattern);
    }
  });

  it('should name the worker after the project', () => {
    expect(config.name).toBe('nodiwears');
  });
});

describe('static asset headers', () => {
  const headers = read('public/_headers');

  it.each([
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Strict-Transport-Security:',
    "frame-ancestors 'none'",
    "object-src 'none'",
  ])('should send the %s protection on every page', (expected) => {
    expect(headers).toContain(expected);
  });

  it('should not allow remote scripts or styles in the content security policy', () => {
    const policy = headers.split('\n').find((line) => line.includes('Content-Security-Policy')) ?? '';

    expect(policy).toContain("script-src 'self'");
    expect(policy).not.toMatch(/https?:\/\//);
  });

  it('should cache fingerprinted build files as immutable', () => {
    expect(headers).toMatch(/\/_astro\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
  });
});

describe('build tooling', () => {
  it('should pin the Node major version used by Cloudflare builds', () => {
    expect(read('.node-version').trim()).toBe('22');
  });

  it('should keep Wrangler local state out of git', () => {
    expect(read('.gitignore')).toContain('.wrangler/');
  });
});

describe('production domain', () => {
  const host = new URL(siteConfig.url).hostname;

  it('should serve the site over HTTPS on the www host', () => {
    expect(siteConfig.url).toBe(`https://${host}`);
    expect(host).toBe('www.nodiwears.com');
  });

  it('should keep the Astro site setting in sync with the site config', () => {
    expect(read('astro.config.mjs')).toContain(`site: '${siteConfig.url}'`);
  });

  it('should point crawlers at the sitemap on the production domain', () => {
    const robots = read('public/robots.txt');

    expect(robots).toContain(`Sitemap: ${siteConfig.url}/sitemap.xml`);
    expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m);
  });
});

describe('deploy workflow', () => {
  const workflow = read('.github/workflows/deploy.yml');
  const step = (name: string) => workflow.indexOf(`- name: ${name}`);

  it('should deploy only from main, and let pull requests and manual runs try the pipeline', () => {
    expect(workflow).toMatch(/push:\n\s+branches: \[main\]/);
    expect(workflow).toMatch(/pull_request:\n\s+branches: \[main\]/);
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toMatch(/- name: Deploy\n\s+if: github\.ref == 'refs\/heads\/main'/);
  });

  it('should run the tests and the build before it checks credentials and deploys', () => {
    expect(step('Test')).toBeGreaterThan(-1);
    expect(step('Test')).toBeLessThan(step('Build'));
    expect(step('Build')).toBeLessThan(step('Check Cloudflare credentials'));
    expect(step('Check Cloudflare credentials')).toBeLessThan(step('Deploy'));
  });

  it('should verify the Cloudflare credentials without deploying', () => {
    expect(workflow).toContain('run: npx wrangler whoami');
  });

  it('should read the Cloudflare credentials from repository secrets', () => {
    expect(workflow).toContain('${{ secrets.CLOUDFLARE_API_TOKEN }}');
    expect(workflow).toContain('${{ secrets.CLOUDFLARE_ACCOUNT_ID }}');
  });

  it('should use the Node version pinned for the project and a read-only token', () => {
    expect(workflow).toContain('node-version-file: .node-version');
    expect(workflow).toMatch(/permissions:\n\s+contents: read/);
  });

  it('should never run two deploys of the same branch at the same time', () => {
    expect(workflow).toContain('group: deploy-${{ github.ref }}');
  });
});
