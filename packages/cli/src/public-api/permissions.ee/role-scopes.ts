import type { ApiKeyScope } from '@n8n/permissions';

export const OWNER_API_KEY_SCOPES: ApiKeyScope[] = [
	'user:read',
	'user:list',
	'user:create',
	'user:changeRole',
	'user:delete',
	'sourceControl:pull',
	'securityAudit:generate',
	'project:create',
	'project:update',
	'project:delete',
	'project:list',
	'variable:create',
	'variable:delete',
	'variable:list',
	'tag:create',
	'tag:read',
	'tag:update',
	'tag:delete',
	'tag:list',
	'workflowTags:update',
	'workflowTags:list',
	'workflow:create',
	'workflow:read',
	'workflow:update',
	'workflow:delete',
	'workflow:list',
	'workflow:move',
	'workflow:activate',
	'workflow:deactivate',
	'execution:delete',
	'execution:read',
	'execution:list',
	'execution:get',
	'credential:create',
	'credential:move',
	'credential:delete',
];

export const ADMIN_API_KEY_SCOPES: ApiKeyScope[] = OWNER_API_KEY_SCOPES;

export const MEMBER_API_KEY_SCOPES: ApiKeyScope[] = [
	'tag:create',
	'tag:read',
	'tag:update',
	'tag:list',
	'workflowTags:update',
	'workflowTags:list',
	'workflow:create',
	'workflow:read',
	'workflow:update',
	'workflow:delete',
	'workflow:list',
	'workflow:move',
	'workflow:activate',
	'workflow:deactivate',
	'execution:delete',
	'execution:read',
	'execution:list',
	'execution:get',
	'credential:create',
	'credential:move',
	'credential:delete',
];
