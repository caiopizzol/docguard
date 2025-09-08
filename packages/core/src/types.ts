// Core TypeScript types for DocGuard

export interface DetectionResult {
    file: string;
    category: string;
    severity: 'info' | 'warning' | 'critical';
    removals: Term[];
    additions: Term[];
    context: Context;
}

export interface Term {
    value: string;
    line: number;
    column: number;
}

export interface Context {
    before: string[];  // Lines of context before
    after: string[];   // Lines of context after
    changeType: 'removal' | 'modification' | 'addition';
}

export interface PatternSet {
    authentication: Pattern[];
    rateLimits: Pattern[];
    errors: Pattern[];
    [category: string]: Pattern[];
}

export interface Pattern {
    terms: string[];
    regex?: RegExp;
    severity: 'info' | 'warning' | 'critical';
}

export interface FileChange {
    path: string;
    before: string;
    after: string;
}

export interface DetectorOptions {
    patterns?: PatternSet;
    ignoreFiles?: string[];
    contextLines?: number;
}
