import {
  textRoleVariants,
  textToneVariants,
} from '@/shared/ui/primitives/Typography';

describe('textRoleVariants', () => {
  it('hero — text-3xl font-bold leading-snug', () => {
    const cls = textRoleVariants({ role: 'hero' });
    expect(cls).toContain('text-3xl');
    expect(cls).toContain('font-bold');
    expect(cls).toContain('leading-snug');
  });

  it('pageTitle — text-2xl font-bold', () => {
    const cls = textRoleVariants({ role: 'pageTitle' });
    expect(cls).toContain('text-2xl');
    expect(cls).toContain('font-bold');
  });

  it('sectionTitle — text-base font-bold', () => {
    const cls = textRoleVariants({ role: 'sectionTitle' });
    expect(cls).toContain('text-base');
    expect(cls).toContain('font-bold');
  });

  it('body — text-base leading-5', () => {
    const cls = textRoleVariants({ role: 'body' });
    expect(cls).toContain('text-base');
    expect(cls).toContain('leading-5');
    expect(cls).not.toContain('font-bold');
  });

  it('caption — text-xs', () => {
    const cls = textRoleVariants({ role: 'caption' });
    expect(cls).toContain('text-xs');
  });
});

describe('textToneVariants', () => {
  it('text → text-text', () => {
    expect(textToneVariants({ tone: 'text' })).toContain('text-text');
  });

  it('brand → text-brand', () => {
    expect(textToneVariants({ tone: 'brand' })).toContain('text-brand');
  });

  it('muted → text-brand-muted', () => {
    expect(textToneVariants({ tone: 'muted' })).toContain('text-brand-muted');
  });

  it('faint → text-brand-faint', () => {
    expect(textToneVariants({ tone: 'faint' })).toContain('text-brand-faint');
  });

  it('ink → text-ink', () => {
    expect(textToneVariants({ tone: 'ink' })).toContain('text-ink');
  });
});
