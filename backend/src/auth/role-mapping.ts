import { SubsystemRole } from './core-hub-identity';

/**
 * Core Hub role -> Subsystem role (spec §14, authorization.md).
 *
 *   Core Hub Role      Subsystem Role
 *   ---------------------------------
 *   student            STUDENT
 *   alumni             ALUMNI
 *   staff              STAFF
 *   lecturer           STAFF
 *   admin              ADMIN
 *
 * `guest` is intentionally unmapped (returns null), which results in HTTP 403 Forbidden
 * as agreed in G0 (#7).
 */
export const CORE_ROLE_TO_SUBSYSTEM_ROLE: Readonly<Record<string, SubsystemRole>> = Object.freeze({
  student: SubsystemRole.STUDENT,
  alumni: SubsystemRole.ALUMNI,
  staff: SubsystemRole.STAFF,
  lecturer: SubsystemRole.STAFF,
  admin: SubsystemRole.ADMIN,
});

/**
 * Returns the subsystem role for a Core Hub role, or `null` when the Core Hub
 * role has no meaning in this subsystem (authenticated, but not authorized -> 403).
 */
export function mapCoreRoleToSubsystemRole(coreRole: string | undefined): SubsystemRole | null {
  if (typeof coreRole !== 'string') {
    return null;
  }
  return CORE_ROLE_TO_SUBSYSTEM_ROLE[coreRole.trim().toLowerCase()] ?? null;
}
