import { SubsystemRole } from './core-hub-identity';
import { Permission, ROLE_PERMISSIONS, can, canAny } from './permissions';

describe('Subsystem permission model (spec §15, §16)', () => {
  describe('STUDENT', () => {
    const role = SubsystemRole.STUDENT;

    it('can read quick links', () => {
      expect(can(role, Permission.QUICK_LINK_READ_ANY)).toBe(true);
    });

    it('cannot manage or delete quick links', () => {
      expect(can(role, Permission.QUICK_LINK_MANAGE)).toBe(false);
      expect(can(role, Permission.QUICK_LINK_DELETE)).toBe(false);
    });
  });

  describe('ALUMNI', () => {
    it('is read-only', () => {
      const role = SubsystemRole.ALUMNI;
      expect(can(role, Permission.QUICK_LINK_READ_ANY)).toBe(true);
      expect(can(role, Permission.QUICK_LINK_MANAGE)).toBe(false);
      expect(can(role, Permission.QUICK_LINK_DELETE)).toBe(false);
    });
  });

  describe('STAFF', () => {
    const role = SubsystemRole.STAFF;

    it('can read and manage quick links', () => {
      expect(can(role, Permission.QUICK_LINK_READ_ANY)).toBe(true);
      expect(can(role, Permission.QUICK_LINK_MANAGE)).toBe(true);
    });

    it('cannot delete quick links (admin only)', () => {
      expect(can(role, Permission.QUICK_LINK_DELETE)).toBe(false);
    });
  });


  describe('ADMIN', () => {
    it('holds every permission', () => {
      for (const permission of Object.values(Permission)) {
        expect(can(SubsystemRole.ADMIN, permission)).toBe(true);
      }
    });
  });

  it('canAny passes when at least one permission matches', () => {
    expect(
      canAny(SubsystemRole.STUDENT, [Permission.QUICK_LINK_READ_ANY, Permission.QUICK_LINK_MANAGE]),
    ).toBe(true);
    expect(
      canAny(SubsystemRole.ALUMNI, [Permission.QUICK_LINK_MANAGE]),
    ).toBe(false);
  });

  it('defines permissions for every subsystem role', () => {
    for (const role of Object.values(SubsystemRole)) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
    }
  });
});
