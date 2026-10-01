import { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Reflector } from '@nestjs/core';
import { AuthEventsLogger } from '../auth/auth-events.logger';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Permission } from '../auth/permissions';
import { AppException } from '../common/errors';

class DummyController {
  @RequirePermissions(Permission.QUICK_LINK_MANAGE)
  create() {}
}

describe('QuickLinks (Auth)', () => {
  it('throws 403 Forbidden for STUDENT role when creating quick link', async () => {
    const mockAuthEvents = {
      authorizationDenied: jest.fn(),
      forbiddenMissingPermissions: jest.fn(),
    } as unknown as AuthEventsLogger;

    const guard = new PermissionsGuard(new Reflector(), mockAuthEvents);
    
    const mockContext = {
      getHandler: () => DummyController.prototype.create,
      getClass: () => DummyController,
      switchToHttp: () => ({
        getRequest: () => ({
          user: { subsystemRole: 'STUDENT' },
          path: '/api/v1/quick-links'
        }),
      }),
    } as unknown as ExecutionContext;

    try {
      const canActivate = guard.canActivate(mockContext);
      if (!canActivate) {
        throw new Error('should throw');
      }
    } catch (e) {
      expect(e).toBeInstanceOf(AppException);
      expect((e as AppException).code).toBe('FORBIDDEN');
    }
  });
});
