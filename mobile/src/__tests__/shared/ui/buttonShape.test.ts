import { buttonVariants } from '@/shared/ui/primitives/buttonVariants';

describe('buttonVariants shape', () => {
  it('default — rounded-xl', () => {
    const cls = buttonVariants({ shape: 'default' });
    expect(cls).toContain('rounded-xl');
    expect(cls).not.toContain('rounded-full');
  });

  it('round — rounded-full (pill CTA)', () => {
    const cls = buttonVariants({ shape: 'round' });
    expect(cls).toContain('rounded-full');
    expect(cls).not.toContain('rounded-xl');
  });

  it('미지정 shape는 defaultVariants로 rounded-xl', () => {
    const cls = buttonVariants({});
    expect(cls).toContain('rounded-xl');
  });
});
