import {
	API_KEY_ADMIN_RESOURCES,
	API_KEY_MEMBER_RESOURCES,
	API_KEY_OWNER_RESOURCES,
	API_KEY_RESOURCES,
} from './constants.ee';
import type { ApiKeyScope, GlobalRole } from './types.ee';

const generateScopesFromResources = (
	resources: typeof API_KEY_MEMBER_RESOURCES | typeof API_KEY_OWNER_RESOURCES,
): Set<ApiKeyScope> => {
	const scopesSet = new Set<ApiKeyScope>();

	resources.forEach((resource) => {
		const operations = API_KEY_RESOURCES[resource as keyof typeof API_KEY_RESOURCES];
		if (operations) {
			operations.forEach((operation) => {
				scopesSet.add(`${resource}:${operation}` as ApiKeyScope);
			});
		}
	});

	return scopesSet;
};

export const getApiKeyScopesForRole = (role: GlobalRole) => {
	let roleResources: typeof API_KEY_MEMBER_RESOURCES | typeof API_KEY_OWNER_RESOURCES = [];

	if (role === 'global:owner') {
		roleResources = API_KEY_OWNER_RESOURCES;
	} else if (role === 'global:member') {
		roleResources = API_KEY_MEMBER_RESOURCES;
	} else if (role === 'global:admin') {
		roleResources = API_KEY_ADMIN_RESOURCES;
	}

	const scopes = generateScopesFromResources(roleResources);

	if (role === 'global:member') {
		scopes.delete('tag:delete');
	}

	return Array.from(scopes);
};

export const getAllApiKeyScopes = () => {
	// Owner has access to everything so return the owner scopes
	return Array.from(generateScopesFromResources(API_KEY_OWNER_RESOURCES));
};

export const getOwnerOnlyApiKeyScopes = () => {
	const ownerScopes = generateScopesFromResources(API_KEY_OWNER_RESOURCES);
	const memberScopes = generateScopesFromResources(API_KEY_MEMBER_RESOURCES);
	memberScopes.forEach((item) => ownerScopes.delete(item));
	return Array.from(ownerScopes);
};
