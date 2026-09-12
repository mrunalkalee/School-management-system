import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'class_subject_service_roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
