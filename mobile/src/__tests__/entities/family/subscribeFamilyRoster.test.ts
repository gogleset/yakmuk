import { subscribeFamilyRoster } from '@/entities/family/api/subscribe-family-roster';

const channelMocks: {
  on: jest.Mock;
  subscribe: jest.Mock;
}[] = [];

jest.mock('@/shared/api/client', () => ({
  supabase: {
    channel: jest.fn(() => {
      const ch = {
        on: jest.fn(function (this: unknown) {
          return this;
        }),
        subscribe: jest.fn(function (this: unknown) {
          return this;
        }),
      };
      channelMocks.push(ch);
      return ch;
    }),
    removeChannel: jest.fn(),
  },
}));

describe('subscribeFamilyRoster', () => {
  beforeEach(() => {
    channelMocks.length = 0;
    jest.clearAllMocks();
  });

  it('subscribes to family_invites and users for familyId', () => {
    const onChange = jest.fn();
    const unsub = subscribeFamilyRoster('fam-1', onChange);

    expect(channelMocks).toHaveLength(1);
    const ch = channelMocks[0]!;
    expect(ch.on).toHaveBeenCalledTimes(2);

    const tables = ch.on.mock.calls.map(
      (call) => (call[1] as { table: string }).table,
    );
    expect(tables).toEqual(['family_invites', 'users']);

    const filters = ch.on.mock.calls.map(
      (call) => (call[1] as { filter: string }).filter,
    );
    expect(filters.every((f) => f === 'family_id=eq.fam-1')).toBe(true);

    unsub();
    const { supabase } = jest.requireMock('@/shared/api/client') as {
      supabase: { removeChannel: jest.Mock };
    };
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
