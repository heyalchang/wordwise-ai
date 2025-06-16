/**
 * Utility functions for mapping offsets between HTML content and plain text
 * This is crucial for accurate grammar highlighting when users have formatting
 */

interface OffsetMapping {
  htmlToText: Map<number, number>;
  textToHtml: Map<number, number>;
}

/**
 * Creates a mapping between HTML character positions and plain text positions
 * This allows us to translate LanguageTool offsets back to HTML positions
 */
export function createOffsetMapping(html: string): OffsetMapping {
  const htmlToText = new Map<number, number>();
  const textToHtml = new Map<number, number>();

  let textIndex = 0;
  let inTag = false;

  for (let i = 0; i < html.length; i++) {
    const char = html[i];

    if (char === '<') {
      inTag = true;
    } else if (char === '>' && inTag) {
      inTag = false;
      continue;
    }

    if (!inTag) {
      // Map both directions
      htmlToText.set(i, textIndex);
      textToHtml.set(textIndex, i);
      textIndex++;
    }
  }

  return { htmlToText, textToHtml };
}

/**
 * Converts HTML content to plain text (same logic as LanguageTool expects)
 */
export function htmlToPlainText(html: string): string {
  // Remove HTML tags but preserve text content
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Maps a plain text offset (from LanguageTool) to HTML offset
 */
export function mapTextOffsetToHtml(
  textOffset: number,
  mapping: OffsetMapping
): number {
  return mapping.textToHtml.get(textOffset) ?? textOffset;
}

/**
 * Maps an HTML offset to plain text offset
 */
export function mapHtmlOffsetToText(
  htmlOffset: number,
  mapping: OffsetMapping
): number {
  return mapping.htmlToText.get(htmlOffset) ?? htmlOffset;
}

/**
 * Maps a range from plain text coordinates to HTML coordinates
 */
export function mapTextRangeToHtml(
  start: number,
  end: number,
  mapping: OffsetMapping
): { start: number; end: number } {
  return {
    start: mapTextOffsetToHtml(start, mapping),
    end: mapTextOffsetToHtml(end, mapping),
  };
}

/**
 * Gets the plain text content and offset mapping for a Tiptap editor
 */
export function getEditorTextAndMapping(html: string): {
  plainText: string;
  mapping: OffsetMapping;
} {
  const plainText = htmlToPlainText(html);
  const mapping = createOffsetMapping(html);

  return { plainText, mapping };
}
