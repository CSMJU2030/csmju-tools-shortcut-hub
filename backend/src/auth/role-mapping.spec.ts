import { SubsystemRole } from './core-hub-identity';
import { mapCoreRoleToSubsystemRole } from './role-mapping';

describe('Core role -> subsystem role mapping (spec §14, authorization.md, G0 #7)', () => {
  it.each([
    ['student', SubsystemRole.STUDENT],
    ['alumni', SubsystemRole.ALUMNI],
    ['staff', SubsystemRole.STAFF],
    ['lecturer', SubsystemRole.STAFF],
    ['admin', SubsystemRole.ADMIN],
  ])('maps core role "%s" to %s', (coreRole, expected) => {
    expect(mapCoreRoleToSubsystemRole(coreRole)).toBe(expected);
  });

  it('is case and whitespace tolerant', () => {
    expect(mapCoreRoleToSubsystemRole('  STAFF ')).toBe(SubsystemRole.STAFF);
    expect(mapCoreRoleToSubsystemRole('  LECTURER ')).toBe(SubsystemRole.STAFF);
  });

  it('does not map guest (returns null for 403 Forbidden as agreed in G0 #7)', () => {
    expect(mapCoreRoleToSubsystemRole('guest')).toBeNull();
  });

  it('returns null for a Core Hub role this subsystem does not know', () => {
    expect(mapCoreRoleToSubsystemRole('finance-officer')).toBeNull();
  });

  it('returns null when the token carries no role claim', () => {
    expect(mapCoreRoleToSubsystemRole(undefined)).toBeNull();
  });
});
