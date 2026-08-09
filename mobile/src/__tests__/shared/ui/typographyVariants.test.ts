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

  it('titleMd — text-[15px] font-bold', () => {
    const cls = textRoleVariants({ role: 'titleMd' });
    expect(cls).toContain('text-[15px]');
    expect(cls).toContain('font-bold');
  });

  it('titleLg — text-lg font-bold', () => {
    const cls = textRoleVariants({ role: 'titleLg' });
    expect(cls).toContain('text-lg');
    expect(cls).toContain('font-bold');
  });

  it('titleXl — text-xl font-bold', () => {
    const cls = textRoleVariants({ role: 'titleXl' });
    expect(cls).toContain('text-xl');
    expect(cls).toContain('font-bold');
  });

  it('labelXs — text-xs font-semibold', () => {
    const cls = textRoleVariants({ role: 'labelXs' });
    expect(cls).toContain('text-xs');
    expect(cls).toContain('font-semibold');
  });

  it('labelSm — text-sm font-semibold', () => {
    const cls = textRoleVariants({ role: 'labelSm' });
    expect(cls).toContain('text-sm');
    expect(cls).toContain('font-semibold');
  });

  it('labelMd — text-base font-semibold', () => {
    const cls = textRoleVariants({ role: 'labelMd' });
    expect(cls).toContain('text-base');
    expect(cls).toContain('font-semibold');
  });

  it('labelLg — text-lg font-semibold', () => {
    const cls = textRoleVariants({ role: 'labelLg' });
    expect(cls).toContain('text-lg');
    expect(cls).toContain('font-semibold');
  });

  it('labelTight — text-[15px] font-semibold', () => {
    const cls = textRoleVariants({ role: 'labelTight' });
    expect(cls).toContain('text-[15px]');
    expect(cls).toContain('font-semibold');
  });

  it('code — text-2xl font-semibold tracking-widest', () => {
    const cls = textRoleVariants({ role: 'code' });
    expect(cls).toContain('text-2xl');
    expect(cls).toContain('font-semibold');
    expect(cls).toContain('tracking-widest');
  });

  it('display — text-6xl font-bold tracking-tight', () => {
    const cls = textRoleVariants({ role: 'display' });
    expect(cls).toContain('text-6xl');
    expect(cls).toContain('font-bold');
    expect(cls).toContain('tracking-tight');
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

  it('sky → text-sky', () => {
    expect(textToneVariants({ tone: 'sky' })).toContain('text-sky');
  });

  it('warning → text-warning', () => {
    expect(textToneVariants({ tone: 'warning' })).toContain('text-warning');
  });

  it('destructive → text-destructive', () => {
    expect(textToneVariants({ tone: 'destructive' })).toContain(
      'text-destructive',
    );
  });
});
