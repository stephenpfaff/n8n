// /* eslint-disable import/no-cycle */
// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */

// import { Application } from "express";
// import { ActiveWorkflowRunner, IExternalHooksClass } from "../../..";

// export interface N8nApp {
// 	app: Application;
// 	restEndpoint: string;
// 	externalHooks: IExternalHooksClass;
// 	defaultCredentialsName: string;
// 	activeWorkflowRunner: ActiveWorkflowRunner.ActiveWorkflowRunner;
// }

// export function userMethods(this: N8nApp): void {
// 	// ----------------------------------------
// 	// login a user
// 	// ----------------------------------------

// 	// this.app.post(
// 	// 	`/${this.restEndpoint}/login`,
// 	// 	ResponseHelper.send(async (req: Request, res: Response): Promise<PublicUser> => {
// 	// 		if (!req.body.email) {
// 	// 			throw new Error('Email is required to log in');
// 	// 		}

// 	// 		if (!req.body.password) {
// 	// 			throw new Error('Password is required to log in');
// 	// 		}

// 	// 		let user;
// 	// 		try {
// 	// 			user = await Db.collections.User!.findOne(
// 	// 				{
// 	// 					email: req.body.email as string,
// 	// 				},
// 	// 				{
// 	// 					relations: ['globalRole'],
// 	// 				},
// 	// 			);
// 	// 		} catch (error) {
// 	// 			throw new Error('Unable to access database.');
// 	// 		}
// 	// 		if (!user || !user.password || !(await compare(req.body.password, user.password))) {
// 	// 			// password is empty until user signs up
// 	// 			const error = new Error('Username or password invalid');
// 	// 			// @ts-ignore
// 	// 			error.httpStatusCode = 401;
// 	// 			throw error;
// 	// 		}

// 	// 		await issueCookie(res, user);

// 	// 		return sanitizeUser(user);
// 	// 	}),
// 	// );

// 	// this.app.get(
// 	// 	`/${this.restEndpoint}/login`,
// 	// 	ResponseHelper.send(async (req: Request, res: Response): Promise<PublicUser> => {
// 	// 		// Manually check the existing cookie.

// 	// 		const cookieContents = req.cookies?.['n8n-auth'] as string | undefined;

// 	// 		let user: User;
// 	// 		if (cookieContents) {
// 	// 			// If logged in, return user
// 	// 			try {
// 	// 				user = await resolveJwt(cookieContents);
// 	// 				return sanitizeUser(user);
// 	// 			} catch (error) {
// 	// 				throw new Error('Invalid login information');
// 	// 			}
// 	// 		}

// 	// 		if (await isInstanceOwnerSetup()) {
// 	// 			const error = new Error('Not logged in');
// 	// 			// @ts-ignore
// 	// 			error.httpStatusCode = 401;
// 	// 			throw error;
// 	// 		}

// 	// 		try {
// 	// 			user = await Db.collections.User!.findOneOrFail({ relations: ['globalRole'] });
// 	// 		} catch (error) {
// 	// 			throw new Error(
// 	// 				'No users found in database - did you wipe the users table? Create at least one user.',
// 	// 			);
// 	// 		}

// 	// 		if (user.email || user.password) {
// 	// 			throw new Error('Invalid database state - user has password set.');
// 	// 		}

// 	// 		await issueCookie(res, user);

// 	// 		return sanitizeUser(user);
// 	// 	}),
// 	// );

// 	// this.app.post(
// 	// 	`/${this.restEndpoint}/logout`,
// 	// 	ResponseHelper.send(async (req: Request, res: Response): Promise<IDataObject> => {
// 	// 		res.clearCookie('n8n-auth');
// 	// 		return {
// 	// 			loggedOut: true,
// 	// 		};
// 	// 	}),
// 	// );
// }

import express = require('express');
import { ResponseHelper } from '../../..';

module.exports = {
	// the express handler implementation for ping
	deleteUser: (req: express.Request, res: express.Response) => {
		console.log('Se llamo get users');
		ResponseHelper.sendSuccessResponse(res, {}, true, 204);
	},
}; 
