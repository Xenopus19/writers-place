import { describe, expect, it } from 'vitest';
import { createCommentSchema } from '../src/schemas/commentSchema.js';

describe('createCommentSchema', () => {
  it('trims text and accepts the 150-character limit', () => {
    expect(
      createCommentSchema.parse({ text: `  ${'x'.repeat(150)}  ` })
    ).toEqual({
      text: 'x'.repeat(150),
    });
  });

  it.each([
    {},
    { text: '' },
    { text: '   ' },
    { text: 10 },
    { text: 'x'.repeat(151) },
  ])('rejects invalid input %#', (input) => {
    expect(createCommentSchema.safeParse(input).success).toBe(false);
  });
});
