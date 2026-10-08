import { SubsystemRole } from './core-hub-identity';

export enum Permission {
  QUICK_LINK_READ_ANY = 'quick-link:read:any',
  QUICK_LINK_MANAGE = 'quick-link:manage',
  QUICK_LINK_DELETE = 'quick-link:delete',
}


const STUDENT_PERMISSIONS: Permission[] = [
  Permission.QUICK_LINK_READ_ANY,
];

const ALUMNI_PERMISSIONS: Permission[] = [
  Permission.QUICK_LINK_READ_ANY,
];

const LECTURER_PERMISSIONS: Permission[] = [
  Permission.QUICK_LINK_READ_ANY,
];

const STAFF_PERMISSIONS: Permission[] = [
  Permission.QUICK_LINK_READ_ANY,
  Permission.QUICK_LINK_MANAGE,
  Permission.QUICK_LINK_DELETE,
];


const ADMIN_PERMISSIONS: Permission[] = Object.values(Permission);

export const ROLE_PERMISSIONS: Readonly<Record<SubsystemRole, readonly Permission[]>> =
  Object.freeze({
    [SubsystemRole.STUDENT]: Object.freeze(STUDENT_PERMISSIONS),
    [SubsystemRole.ALUMNI]: Object.freeze(ALUMNI_PERMISSIONS),
    [SubsystemRole.LECTURER]: Object.freeze(LECTURER_PERMISSIONS),
    [SubsystemRole.STAFF]: Object.freeze(STAFF_PERMISSIONS),
    [SubsystemRole.ADMIN]: Object.freeze(ADMIN_PERMISSIONS),
  });

export function can(role: SubsystemRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAny(role: SubsystemRole, permissions: readonly Permission[]): boolean {
  return permissions.some((permission) => can(role, permission));
}
