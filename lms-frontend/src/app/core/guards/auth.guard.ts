import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }
    auth.resetTimer();
    return true;
};

export function roleGuard(...allowedRoles: string[]): CanActivateFn {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);

        if (!auth.isLoggedIn()) {
            router.navigate(['/login']);
            return false;
        }

        const role = auth.getRole();
        if (role && allowedRoles.includes(role)) {
            auth.resetTimer();
            return true;
        }

        router.navigate(['/dashboard']);
        return false;
    };
}
