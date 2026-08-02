import { buildCarePushCopy } from '@/entities/family/lib/carePushCopy';

describe('buildCarePushCopy', () => {
  it('taken — 닉네임 포함 안부 톤', () => {
    const copy = buildCarePushCopy('taken', '엄마');
    expect(copy.title).toBeTruthy();
    expect(copy.body).toContain('엄마');
    expect(copy.body).not.toMatch(/점수|감시|CCTV/i);
  });

  it('stuck — 닉네임 없으면 fallback', () => {
    const copy = buildCarePushCopy('stuck_escalate', null);
    expect(copy.title).toBeTruthy();
    expect(copy.body.length).toBeGreaterThan(0);
  });
});
