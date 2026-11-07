import JSON5 from 'json5';

/**
 * Parses strict JSON, JSONC (comments, trailing commas) and JSON5.
 *
 * JSON5 is a superset of the other two but much slower, so it only runs on text
 * that strict JSON rejects. Its error is the one surfaced, as it has line:column.
 */
export function parseJson(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return JSON5.parse(text);
    }
}
