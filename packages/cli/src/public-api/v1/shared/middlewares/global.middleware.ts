/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Container } from '@n8n/di';
import type { ApiKeyScope, Scope } from '@n8n/permissions';
import type { NextFunction } from 'express';
import type express from 'express';

import { FeatureNotLicensedError } from '@/errors/feature-not-licensed.error';
import type { BooleanLicenseFeature } from '@/interfaces';
import { License } from '@/license';
import { userHasScopes } from '@/permissions.ee/check-access';
import type { AuthenticatedRequest } from '@/requests';
import { PublicApiKeyService } from '@/services/public-api-key.service';

import type { PaginatedRequest } from '../../../types';
import { decodeCursor } from '../services/pagination.service';

const UNLIMITED_USERS_QUOTA = -1;

export type ProjectScopeResource = 'workflow' | 'credential';

const buildScopeMiddleware = (
	scopes: Scope[],
	resource?: ProjectScopeResource,
	{ globalOnly } = { globalOnly: false },
) => {
	return async (
		req: AuthenticatedRequest<{ id?: string }>,
		res: express.Response,
		next: express.NextFunction,
	): Promise<express.Response | void> => {
		const params: { credentialId?: string; workflowId?: string } = {};
		if (req.params.id) {
			if (resource === 'workflow') {
				params.workflowId = req.params.id;
			} else if (resource === 'credential') {
				params.credentialId = req.params.id;
			}
		}
		if (!(await userHasScopes(req.user, scopes, globalOnly, params))) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		return next();
	};
};

export const globalScope = (scopes: Scope | Scope[]) =>
	buildScopeMiddleware(Array.isArray(scopes) ? scopes : [scopes], undefined, { globalOnly: true });

export const projectScope = (scopes: Scope | Scope[], resource: ProjectScopeResource) =>
	buildScopeMiddleware(Array.isArray(scopes) ? scopes : [scopes], resource, { globalOnly: false });

export const validCursor = (
	req: PaginatedRequest,
	res: express.Response,
	next: express.NextFunction,
): express.Response | void => {
	if (req.query.cursor) {
		const { cursor } = req.query;
		try {
			const paginationData = decodeCursor(cursor);
			if ('offset' in paginationData) {
				req.query.offset = paginationData.offset;
				req.query.limit = paginationData.limit;
			} else {
				req.query.lastId = paginationData.lastId;
				req.query.limit = paginationData.limit;
			}
		} catch (error) {
			return res.status(400).json({
				message: 'An invalid cursor was provided',
			});
		}
	}

	return next();
};

export const apiKeyHasScope = (
	apiKeyScope: ApiKeyScope,
	{ checkGlobalScopeIfScopesDisabled } = { checkGlobalScopeIfScopesDisabled: true },
) => {
	const emptyMiddleware = (_req: Request, _res: Response, next: NextFunction) => next();

	return Container.get(License).isApiKeyScopesEnabled()
		? Container.get(PublicApiKeyService).getApiKeyScopeMiddleware(apiKeyScope)
		: checkGlobalScopeIfScopesDisabled
			? globalScope(apiKeyScope as Scope)
			: emptyMiddleware;
};

export const validLicenseWithUserQuota = (
	_: express.Request,
	res: express.Response,
	next: express.NextFunction,
): express.Response | void => {
	const license = Container.get(License);
	if (license.getUsersLimit() !== UNLIMITED_USERS_QUOTA) {
		return res.status(403).json({
			message: '/users path can only be used with a valid license. See https://n8n.io/pricing/',
		});
	}

	return next();
};

export const isLicensed = (feature: BooleanLicenseFeature) => {
	return async (_: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
		if (Container.get(License).isFeatureEnabled(feature)) return next();

		return res.status(403).json({ message: new FeatureNotLicensedError(feature).message });
	};
};
