import type { INodeTypeBaseDescription, IVersionedNodeType, INodeType } from './Interfaces';
import { deepCopy } from './utils';

export class VersionedNodeType implements IVersionedNodeType {
	currentVersion: number;

	nodeVersions: IVersionedNodeType['nodeVersions'];

	description: INodeTypeBaseDescription;

	constructor(
		nodeVersions: IVersionedNodeType['nodeVersions'],
		description: INodeTypeBaseDescription,
	) {
		this.nodeVersions = Object.fromEntries(
			Object.entries(nodeVersions).map((x) => [x[0], deepCopy(x[1])]),
		);
		this.currentVersion = description.defaultVersion ?? this.getLatestVersion();
		this.description = description;
	}

	getLatestVersion() {
		return Math.max(...Object.keys(this.nodeVersions).map(Number));
	}

	getNodeType(version?: number): INodeType {
		if (version) {
			return this.nodeVersions[version];
		} else {
			return this.nodeVersions[this.currentVersion];
		}
	}
}
