export const MILLISECONDS_PER_SECOND = 1000;

export function configTimeToMilliseconds(
    seconds: number | undefined,
    deprecatedMilliseconds: number | undefined,
    defaultSeconds: number,
): number {
    if (seconds !== undefined) {
        return seconds * MILLISECONDS_PER_SECOND;
    }

    return deprecatedMilliseconds ?? defaultSeconds * MILLISECONDS_PER_SECOND;
}
