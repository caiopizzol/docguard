// Configuration loader for DocGuard CLI
import { readFileSync, existsSync } from 'fs';
import { PatternSet } from '@docguard/core';

export interface Config {
    watch?: Record<string, { terms: string[]; severity?: string }>;
    ignore?: string[];
}

export function loadConfig(path: string = 'docguard.yml'): Record<string, any> | null {
    if (!existsSync(path)) return null;

    try {
        const yaml = require('js-yaml');
        const config: Config = yaml.load(readFileSync(path, 'utf8'));

        if (!config.watch) return null;

        const patterns: Record<string, any> = {};
        for (const [category, def] of Object.entries(config.watch)) {
            patterns[category] = [{
                terms: def.terms,
                severity: def.severity as any || 'warning'
            }];
        }

        return patterns;
    } catch {
        return null;
    }
}
