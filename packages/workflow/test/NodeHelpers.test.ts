import {
	NodeConnectionTypes,
	type NodeConnectionType,
	type INodeIssues,
	type INode,
	type INodeParameters,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
} from '@/Interfaces';
import {
	getNodeParameters,
	getNodeHints,
	isSubNodeType,
	applyDeclarativeNodeOptionParameters,
	getParameterIssues,
	isTriggerNode,
	isExecutable,
	displayParameter,
} from '@/NodeHelpers';
import type { Workflow } from '@/Workflow';

describe('NodeHelpers', () => {
	describe('getNodeParameters', () => {
		const tests: Array<{
			description: string;
			input: {
				nodePropertiesArray: INodeProperties[];
				nodeValues: INodeParameters | null;
			};
			output: {
				noneDisplayedFalse: {
					defaultsFalse: INodeParameters;
					defaultsTrue: INodeParameters;
				};
				noneDisplayedTrue: {
					defaultsFalse: INodeParameters;
					defaultsTrue: INodeParameters;
				};
			};
		}> = [
			{
				description: 'simple values.',
				input: {
					nodePropertiesArray: [
						{
							name: 'string1',
							displayName: 'String 1',
							type: 'string',
							default: '',
						},
						{
							name: 'string2',
							displayName: 'String 2',
							type: 'string',
							default: 'default string 2',
						},
						{
							name: 'string3',
							displayName: 'String 3',
							type: 'string',
							default: 'default string 3',
						},
						{
							name: 'number1',
							displayName: 'Number 1',
							type: 'number',
							default: 10,
						},
						{
							name: 'number2',
							displayName: 'Number 2',
							type: 'number',
							default: 10,
						},
						{
							name: 'number3',
							displayName: 'Number 3',
							type: 'number',
							default: 10,
						},
						{
							name: 'boolean1',
							displayName: 'Boolean 1',
							type: 'boolean',
							default: false,
						},
						{
							name: 'boolean2',
							displayName: 'Boolean 2',
							type: 'boolean',
							default: false,
						},
						{
							name: 'boolean3',
							displayName: 'Boolean 3',
							type: 'boolean',
							default: true,
						},
						{
							name: 'boolean4',
							displayName: 'Boolean 4',
							type: 'boolean',
							default: true,
						},
						{
							name: 'boolean5',
							displayName: 'Boolean 5',
							type: 'boolean',
							default: false,
						},
						{
							name: 'boolean6',
							displayName: 'Boolean 6',
							type: 'boolean',
							default: true,
						},
					],
					nodeValues: {
						boolean1: true,
						boolean3: false,
						boolean5: false,
						boolean6: true,
						string1: 'different',
						number1: 1,
						number3: 0,
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							boolean1: true,
							boolean3: false,
							string1: 'different',
							number1: 1,
							number3: 0,
						},
						defaultsTrue: {
							boolean1: true,
							boolean2: false,
							boolean3: false,
							boolean4: true,
							boolean5: false,
							boolean6: true,
							string1: 'different',
							string2: 'default string 2',
							string3: 'default string 3',
							number1: 1,
							number2: 10,
							number3: 0,
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							boolean1: true,
							boolean3: false,
							string1: 'different',
							number1: 1,
							number3: 0,
						},
						defaultsTrue: {
							boolean1: true,
							boolean2: false,
							boolean3: false,
							boolean4: true,
							boolean5: false,
							boolean6: true,
							string1: 'different',
							string2: 'default string 2',
							string3: 'default string 3',
							number1: 1,
							number2: 10,
							number3: 0,
						},
					},
				},
			},
			{
				description:
					'simple values with displayOptions "show" (match) which is boolean. All values set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'boolean1',
							displayName: 'boolean1',
							type: 'boolean',
							default: false,
						},
						{
							name: 'string1',
							displayName: 'string1',
							displayOptions: {
								show: {
									boolean1: [true],
								},
							},
							type: 'string',
							default: 'default string1',
						},
					],
					nodeValues: {
						boolean1: true,
						string1: 'own string1',
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							boolean1: true,
							string1: 'own string1',
						},
						defaultsTrue: {
							boolean1: true,
							string1: 'own string1',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							boolean1: true,
							string1: 'own string1',
						},
						defaultsTrue: {
							boolean1: true,
							string1: 'own string1',
						},
					},
				},
			},
			{
				description:
					'simple values with displayOptions "hide" (match) which is boolean. All values set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'boolean1',
							displayName: 'boolean1',
							type: 'boolean',
							default: false,
						},
						{
							name: 'string1',
							displayName: 'string1',
							displayOptions: {
								hide: {
									boolean1: [true],
								},
							},
							type: 'string',
							default: 'default string1',
						},
					],
					nodeValues: {
						boolean1: true,
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							boolean1: true,
						},
						defaultsTrue: {
							boolean1: true,
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							boolean1: true,
						},
						defaultsTrue: {
							boolean1: true,
							string1: 'default string1',
						},
					},
				},
			},
			{
				description:
					'simple values with displayOptions "show" (match) which is boolean. One values set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'boolean1',
							displayName: 'boolean1',
							type: 'boolean',
							default: false,
						},
						{
							name: 'string1',
							displayName: 'string1',
							displayOptions: {
								show: {
									boolean1: [true],
								},
							},
							type: 'string',
							default: 'default string1',
						},
					],
					nodeValues: {
						boolean1: true,
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							boolean1: true,
						},
						defaultsTrue: {
							boolean1: true,
							string1: 'default string1',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							boolean1: true,
						},
						defaultsTrue: {
							boolean1: true,
							string1: 'default string1',
						},
					},
				},
			},
			{
				description: 'simple values with displayOptions "show" (match). No values set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							name: 'string1',
							displayName: 'string1',
							displayOptions: {
								show: {
									mode: ['mode1'],
								},
							},
							type: 'string',
							default: 'default string1',
						},
					],
					nodeValues: {},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							mode: 'mode1',
							string1: 'default string1',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {
							mode: 'mode1',
							string1: 'default string1',
						},
					},
				},
			},
			{
				description:
					'simple values with displayOptions "show" (match) on two which depend on each other of which is boolean. One value should be displayed. One values set (none-default).',
				input: {
					nodePropertiesArray: [
						{
							name: 'string1',
							displayName: 'string1',
							type: 'string',
							default: 'default string1',
						},
						{
							name: 'boolean1',
							displayName: 'boolean1',
							displayOptions: {
								show: {
									string1: ['default string1'],
								},
							},
							type: 'boolean',
							default: false,
						},
						{
							name: 'string2',
							displayName: 'string2',
							displayOptions: {
								show: {
									boolean1: [true],
								},
							},
							type: 'string',
							default: 'default string2',
						},
					],
					nodeValues: {
						boolean1: true,
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							boolean1: true,
						},
						defaultsTrue: {
							string1: 'default string1',
							boolean1: true,
							string2: 'default string2',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							boolean1: true,
						},
						defaultsTrue: {
							string1: 'default string1',
							boolean1: true,
							string2: 'default string2',
						},
					},
				},
			},
			{
				description:
					'simple values with displayOptions "show" (match) on two which depend on each other of which is boolean. One value should be displayed. One values set. (default)',
				input: {
					nodePropertiesArray: [
						{
							name: 'string1',
							displayName: 'string1',
							type: 'string',
							default: 'default string1',
						},
						{
							name: 'boolean1',
							displayName: 'boolean1',
							displayOptions: {
								show: {
									string1: ['default string1'],
								},
							},
							type: 'boolean',
							default: false,
						},
						{
							name: 'string2',
							displayName: 'string2',
							displayOptions: {
								show: {
									boolean1: [true],
								},
							},
							type: 'string',
							default: 'default string2',
						},
					],
					nodeValues: {
						boolean1: false,
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							string1: 'default string1',
							boolean1: false,
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {
							string1: 'default string1',
							boolean1: false,
							string2: 'default string2',
						},
					},
				},
			},
			{
				description: 'simple values with displayOptions "show" (match). All values set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							name: 'string1',
							displayName: 'string1',
							displayOptions: {
								show: {
									mode: ['mode1'],
								},
							},
							type: 'string',
							default: 'default string1',
						},
					],
					nodeValues: {
						mode: 'mode1',
						string1: 'default string1',
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							mode: 'mode1',
							string1: 'default string1',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {
							mode: 'mode1',
							string1: 'default string1',
						},
					},
				},
			},
			{
				description: 'simple values with displayOptions "show" (no-match). No values set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							name: 'string1',
							displayName: 'string1',
							displayOptions: {
								show: {
									mode: ['mode2'],
								},
							},
							type: 'string',
							default: 'default string1',
						},
					],
					nodeValues: {},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							mode: 'mode1',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {
							mode: 'mode1',
							string1: 'default string1',
						},
					},
				},
			},
			{
				description: 'simple values with displayOptions "show" (no-match). All values set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							name: 'string1',
							displayName: 'string1',
							displayOptions: {
								show: {
									mode: ['mode2'],
								},
							},
							type: 'string',
							default: 'default string1',
						},
					],
					nodeValues: {
						mode: 'mode1',
						string1: 'default string1',
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							mode: 'mode1',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {
							mode: 'mode1',
							string1: 'default string1',
						},
					},
				},
			},
			{
				description: 'complex type "fixedCollection" with "multipleValues: true". One value set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'values',
							displayName: 'Values',
							type: 'fixedCollection',
							typeOptions: {
								multipleValues: true,
							},
							default: {},
							options: [
								{
									name: 'boolean',
									displayName: 'Boolean',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											default: 'default string1',
										},
										{
											name: 'boolean1',
											displayName: 'boolean1',
											type: 'boolean',
											default: false,
										},
									],
								},
								{
									name: 'number',
									displayName: 'Number',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											default: 'default string1',
										},
										{
											displayName: 'number1',
											name: 'number1',
											type: 'number',
											default: 0,
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values: {
							number: [
								{
									number1: 1,
								},
							],
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: {
								number: [
									{
										number1: 1,
									},
								],
							},
						},
						defaultsTrue: {
							values: {
								number: [
									{
										string1: 'default string1',
										number1: 1,
									},
								],
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								number: [
									{
										number1: 1,
									},
								],
							},
						},
						defaultsTrue: {
							values: {
								number: [
									{
										string1: 'default string1',
										number1: 1,
									},
								],
							},
						},
					},
				},
			},
			{
				description: 'complex type "fixedCollection" with "multipleValues: false". One value set.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'Values',
							name: 'values',
							type: 'fixedCollection',
							default: {},
							options: [
								{
									name: 'boolean',
									displayName: 'Boolean',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											default: 'default string1',
										},
										{
											name: 'boolean1',
											displayName: 'boolean1',
											type: 'boolean',
											default: false,
										},
									],
								},
								{
									name: 'number',
									displayName: 'Number',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											default: 'default string1',
										},
										{
											displayName: 'number1',
											name: 'number1',
											type: 'number',
											default: 0,
										},
									],
								},
								{
									name: 'singleString',
									displayName: 'Single String',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											default: 'default singleString1',
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values: {
							number: {
								number1: 1,
							},
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: {
								number: {
									number1: 1,
								},
							},
						},
						defaultsTrue: {
							values: {
								number: {
									string1: 'default string1',
									number1: 1,
								},
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								number: {
									number1: 1,
								},
							},
						},
						defaultsTrue: {
							values: {
								number: {
									string1: 'default string1',
									number1: 1,
								},
							},
						},
					},
				},
			},
			{
				description:
					'complex type "fixedCollection" with "multipleValues: false". Two values set one single one.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'Values',
							name: 'values',
							type: 'fixedCollection',
							default: {},
							options: [
								{
									name: 'boolean',
									displayName: 'Boolean',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											default: 'default string1',
										},
										{
											name: 'boolean1',
											displayName: 'boolean1',
											type: 'boolean',
											default: false,
										},
									],
								},
								{
									name: 'number',
									displayName: 'Number',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											default: 'default string1',
										},
										{
											displayName: 'number1',
											name: 'number1',
											type: 'number',
											default: 0,
										},
									],
								},
								{
									name: 'singleString',
									displayName: 'Single String',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											default: 'default singleString1',
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values: {
							number: {
								number1: 1,
							},
							singleString: {
								string1: 'value1',
							},
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: {
								number: {
									number1: 1,
								},
								singleString: {
									string1: 'value1',
								},
							},
						},
						defaultsTrue: {
							values: {
								number: {
									string1: 'default string1',
									number1: 1,
								},
								singleString: {
									string1: 'value1',
								},
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								number: {
									number1: 1,
								},
								singleString: {
									string1: 'value1',
								},
							},
						},
						defaultsTrue: {
							values: {
								number: {
									string1: 'default string1',
									number1: 1,
								},
								singleString: {
									string1: 'value1',
								},
							},
						},
					},
				},
			},
			{
				description:
					'complex type "fixedCollection" with "multipleValues: true" and complex type "collection"  with "multipleValues: true". One value set each.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'Values',
							name: 'values',
							type: 'fixedCollection',
							typeOptions: {
								multipleValues: true,
							},
							description: 'The value to set.',
							default: {},
							options: [
								{
									name: 'boolean',
									displayName: 'Boolean',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											default: 'default string1',
										},
										{
											name: 'boolean1',
											displayName: 'boolean1',
											type: 'boolean',
											default: false,
										},
									],
								},
								{
									name: 'number',
									displayName: 'Number',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											default: 'default string1',
										},
										{
											name: 'number1',
											displayName: 'number1',
											type: 'number',
											default: 0,
										},
										{
											name: 'collection1',
											displayName: 'collection1',
											type: 'collection',
											typeOptions: {
												multipleValues: true,
											},
											default: {},
											options: [
												{
													name: 'string1',
													displayName: 'string1',
													type: 'string',
													default: 'default string1',
												},
												{
													name: 'string2',
													displayName: 'string2',
													type: 'string',
													default: 'default string2',
												},
											],
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values: {
							number: [
								{
									number1: 1,
									collection1: [
										{
											string1: 'value1',
										},
									],
								},
							],
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: {
								number: [
									{
										number1: 1,
										collection1: [
											{
												string1: 'value1',
											},
										],
									},
								],
							},
						},
						defaultsTrue: {
							values: {
								number: [
									{
										string1: 'default string1',
										number1: 1,
										collection1: [
											{
												string1: 'value1',
											},
										],
									},
								],
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								number: [
									{
										number1: 1,
										collection1: [
											{
												string1: 'value1',
											},
										],
									},
								],
							},
						},
						defaultsTrue: {
							values: {
								number: [
									{
										string1: 'default string1',
										number1: 1,
										collection1: [
											{
												string1: 'value1',
											},
										],
									},
								],
							},
						},
					},
				},
			},
			{
				description:
					'complex type "fixedCollection" with "multipleValues: false" and with displayOptions "show" (match) on option. One value set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'values',
							displayName: 'Values',
							type: 'fixedCollection',
							default: {},
							options: [
								{
									name: 'number',
									displayName: 'Number',
									values: [
										{
											name: 'mode',
											displayName: 'mode',
											type: 'string',
											default: 'mode1',
										},
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											displayOptions: {
												show: {
													mode: ['mode1'],
												},
											},
											default: 'default string1',
										},
										{
											name: 'number1',
											displayName: 'number1',
											type: 'number',
											default: 0,
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values: {
							number: {
								number1: 1,
							},
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: {
								number: {
									number1: 1,
								},
							},
						},
						defaultsTrue: {
							values: {
								number: {
									mode: 'mode1',
									string1: 'default string1',
									number1: 1,
								},
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								number: {
									number1: 1,
								},
							},
						},
						defaultsTrue: {
							values: {
								number: {
									mode: 'mode1',
									string1: 'default string1',
									number1: 1,
								},
							},
						},
					},
				},
			},
			{
				description:
					'complex type "fixedCollection" with "multipleValues: false" and with displayOptions "show" (match) on option which references root-value. One value set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							name: 'values',
							displayName: 'Values',
							type: 'fixedCollection',
							default: {},
							options: [
								{
									name: 'number',
									displayName: 'Number',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											displayOptions: {
												show: {
													'/mode': ['mode1'],
												},
											},
											default: 'default string1',
										},
										{
											name: 'number1',
											displayName: 'number1',
											type: 'number',
											default: 0,
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values: {
							number: {
								string1: 'own string1',
							},
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: {
								number: {
									string1: 'own string1',
								},
							},
						},
						defaultsTrue: {
							mode: 'mode1',
							values: {
								number: {
									string1: 'own string1',
									number1: 0,
								},
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								number: {
									string1: 'own string1',
								},
							},
						},
						defaultsTrue: {
							mode: 'mode1',
							values: {
								number: {
									string1: 'own string1',
									number1: 0,
								},
							},
						},
					},
				},
			},
			{
				description:
					'complex type "fixedCollection" with "multipleValues: false" and with displayOptions "show" (no-match) on option which references root-value. One value set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							name: 'values',
							displayName: 'Values',
							type: 'fixedCollection',
							default: {},
							options: [
								{
									name: 'number',
									displayName: 'Number',
									values: [
										{
											name: 'string1',
											displayName: 'string1',
											type: 'string',
											displayOptions: {
												show: {
													'/mode': ['mode2'],
												},
											},
											default: 'default string1',
										},
										{
											name: 'number1',
											displayName: 'number1',
											type: 'number',
											default: 0,
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values: {
							number: {
								string1: 'own string1',
							},
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							mode: 'mode1',
							values: {
								number: {
									number1: 0,
								},
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								number: {
									string1: 'own string1',
								},
							},
						},
						defaultsTrue: {
							mode: 'mode1',
							values: {
								number: {
									string1: 'own string1',
									number1: 0,
								},
							},
						},
					},
				},
			},
			// Remember it is correct that default strings get returned here even when returnDefaults
			// is set to false because if they would not, there would be no way to know which value
			// got added and which one not.
			{
				description:
					'complex type "collection" with "multipleValues: false" and with displayOptions "show" (match) on option which references root-value. One value set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							name: 'values',
							displayName: 'Values',
							type: 'collection',
							default: {},
							options: [
								{
									name: 'string1',
									displayName: 'string1',
									type: 'string',
									displayOptions: {
										show: {
											'/mode': ['mode1'],
										},
									},
									default: 'default string1',
								},
								{
									name: 'number1',
									displayName: 'number1',
									type: 'number',
									default: 0,
								},
							],
						},
					],
					nodeValues: {
						values: {
							string1: 'own string1',
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: {
								string1: 'own string1',
							},
						},
						defaultsTrue: {
							mode: 'mode1',
							values: {
								string1: 'own string1',
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								string1: 'own string1',
							},
						},
						defaultsTrue: {
							mode: 'mode1',
							values: {
								string1: 'own string1',
							},
						},
					},
				},
			},
			// Remember it is correct that default strings get returned here even when returnDefaults
			// is set to false because if they would not, there would be no way to know which value
			// got added and which one not.
			{
				description:
					'complex type "collection" with "multipleValues: false" and with displayOptions "show" (no-match) on option which references root-value. One value set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							name: 'values',
							displayName: 'Values',
							type: 'collection',
							default: {},
							options: [
								{
									name: 'string1',
									displayName: 'string1',
									type: 'string',
									displayOptions: {
										show: {
											'/mode': ['mode2'],
										},
									},
									default: 'default string1',
								},
								{
									name: 'number1',
									displayName: 'number1',
									type: 'number',
									default: 0,
								},
							],
						},
					],
					nodeValues: {
						values: {
							string1: 'own string1',
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							// TODO: Write some code which cleans up data like that
							values: {},
						},
						defaultsTrue: {
							mode: 'mode1',
							values: {},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								string1: 'own string1',
							},
						},
						defaultsTrue: {
							mode: 'mode1',
							values: {
								string1: 'own string1',
							},
						},
					},
				},
			},
			// Remember it is correct that default strings get returned here even when returnDefaults
			// is set to false because if they would not, there would be no way to know which value
			// got added and which one not.
			{
				description:
					'complex type "collection" with "multipleValues: true" and with displayOptions "show" (match) on option which references root-value. One value set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							name: 'values',
							displayName: 'Values',
							type: 'collection',
							typeOptions: {
								multipleValues: true,
							},
							default: {},
							options: [
								{
									name: 'string1',
									displayName: 'string1',
									type: 'string',
									displayOptions: {
										show: {
											'/mode': ['mode1'],
										},
									},
									default: 'default string1',
								},
								{
									name: 'number1',
									displayName: 'number1',
									type: 'number',
									default: 0,
								},
							],
						},
					],
					nodeValues: {
						values: [
							{
								string1: 'own string1',
							},
						],
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: [
								{
									string1: 'own string1',
								},
							],
						},
						defaultsTrue: {
							mode: 'mode1',
							values: [
								{
									string1: 'own string1',
								},
							],
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: [
								{
									string1: 'own string1',
								},
							],
						},
						defaultsTrue: {
							mode: 'mode1',
							values: [
								{
									string1: 'own string1',
								},
							],
						},
					},
				},
			},

			// Remember it is correct that default strings get returned here even when returnDefaults
			// is set to false because if they would not, there would be no way to know which value
			// got added and which one not.
			{
				description:
					'complex type "collection" with "multipleValues: true" and with displayOptions "show" (no-match) on option which references root-value. One value set.',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							name: 'values',
							displayName: 'Values',
							type: 'collection',
							typeOptions: {
								multipleValues: true,
							},
							default: {},
							options: [
								{
									name: 'string1',
									displayName: 'string1',
									type: 'string',
									displayOptions: {
										show: {
											'/mode': ['mode2'],
										},
									},
									default: 'default string1',
								},
								{
									name: 'number1',
									displayName: 'number1',
									type: 'number',
									default: 0,
								},
							],
						},
					],
					nodeValues: {
						values: [
							{
								string1: 'own string1',
								number1: 0,
							},
						],
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: [
								{
									string1: 'own string1',
									number1: 0,
								},
							],
						},
						defaultsTrue: {
							mode: 'mode1',
							values: [
								{
									string1: 'own string1',
									number1: 0,
								},
							],
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: [
								{
									string1: 'own string1',
									number1: 0,
								},
							],
						},
						defaultsTrue: {
							mode: 'mode1',
							values: [
								{
									string1: 'own string1',
									number1: 0,
								},
							],
						},
					},
				},
			},
			{
				description:
					'complex type "fixedCollection" with "multipleValues: false" and with displayOptions "show" (no-match) on option. One value set also the not displayed one.',
				input: {
					nodePropertiesArray: [
						{
							name: 'values',
							displayName: 'Values',
							type: 'fixedCollection',
							default: {},
							options: [
								{
									name: 'number',
									displayName: 'Number',
									values: [
										{
											name: 'mode',
											displayName: 'mode',
											type: 'string',
											default: 'mode1',
										},
										{
											displayName: 'string1',
											name: 'string1',
											type: 'string',
											displayOptions: {
												show: {
													mode: ['mode1'],
												},
											},
											default: 'default string1',
										},
										{
											displayName: 'number1',
											name: 'number1',
											type: 'number',
											default: 0,
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values: {
							number: {
								mode: 'mode2',
								string1: 'default string1',
								number1: 1,
							},
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: {
								number: {
									mode: 'mode2',
									number1: 1,
								},
							},
						},
						defaultsTrue: {
							values: {
								number: {
									mode: 'mode2',
									number1: 1,
								},
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								number: {
									mode: 'mode2',
									number1: 1,
								},
							},
						},
						defaultsTrue: {
							values: {
								number: {
									mode: 'mode2',
									string1: 'default string1',
									number1: 1,
								},
							},
						},
					},
				},
			},
			{
				description:
					'complex type "collection" with "multipleValues: true". One none-default value set.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'collection1',
							name: 'collection1',
							type: 'collection',
							typeOptions: {
								multipleValues: true,
							},
							default: {},
							options: [
								{
									displayName: 'string1',
									name: 'string1',
									type: 'string',
									default: 'default string1',
								},
								{
									displayName: 'string2',
									name: 'string2',
									type: 'string',
									default: 'default string2',
								},
							],
						},
					],
					nodeValues: {
						collection1: [
							{
								string1: 'value1',
							},
						],
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							collection1: [
								{
									string1: 'value1',
								},
							],
						},
						defaultsTrue: {
							collection1: [
								{
									string1: 'value1',
								},
							],
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							collection1: [
								{
									string1: 'value1',
								},
							],
						},
						defaultsTrue: {
							collection1: [
								{
									string1: 'value1',
								},
							],
						},
					},
				},
			},
			// Remember it is correct that default strings get returned here even when returnDefaults
			// is set to false because if they would not, there would be no way to know which value
			// got added and which one not.
			{
				description:
					'complex type "collection" with "multipleValues: true". One default value set.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'collection1',
							name: 'collection1',
							type: 'collection',
							typeOptions: {
								multipleValues: true,
							},
							default: {},
							options: [
								{
									displayName: 'string1',
									name: 'string1',
									type: 'string',
									default: 'default string1',
								},
								{
									displayName: 'string2',
									name: 'string2',
									type: 'string',
									default: 'default string2',
								},
							],
						},
					],
					nodeValues: {
						collection1: [
							{
								string1: 'default string1',
							},
						],
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							collection1: [
								{
									string1: 'default string1',
								},
							],
						},
						defaultsTrue: {
							collection1: [
								{
									string1: 'default string1',
								},
							],
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							collection1: [
								{
									string1: 'default string1',
								},
							],
						},
						defaultsTrue: {
							collection1: [
								{
									string1: 'default string1',
								},
							],
						},
					},
				},
			},
			{
				description:
					'complex type "collection" with "multipleValues: false". One none-default value set.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'collection1',
							name: 'collection1',
							type: 'collection',
							default: {},
							options: [
								{
									displayName: 'string1',
									name: 'string1',
									type: 'string',
									default: 'default string1',
								},
								{
									displayName: 'string2',
									name: 'string2',
									type: 'string',
									default: 'default string2',
								},
							],
						},
					],
					nodeValues: {
						collection1: {
							string1: 'own string1',
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							collection1: {
								string1: 'own string1',
							},
						},
						defaultsTrue: {
							collection1: {
								string1: 'own string1',
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							collection1: {
								string1: 'own string1',
							},
						},
						defaultsTrue: {
							collection1: {
								string1: 'own string1',
							},
						},
					},
				},
			},
			{
				description:
					'complex type "collection" with "multipleValues: false". One default value set.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'collection1',
							name: 'collection1',
							type: 'collection',
							default: {},
							options: [
								{
									displayName: 'string1',
									name: 'string1',
									type: 'string',
									default: 'default string1',
								},
								{
									displayName: 'string2',
									name: 'string2',
									type: 'string',
									default: 'default string2',
								},
							],
						},
					],
					nodeValues: {
						collection1: {
							string1: 'default string1',
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							collection1: {
								string1: 'default string1',
							},
						},
						defaultsTrue: {
							collection1: {
								string1: 'default string1',
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							collection1: {
								string1: 'default string1',
							},
						},
						defaultsTrue: {
							collection1: {
								string1: 'default string1',
							},
						},
					},
				},
			},
			{
				description:
					'complex type "collection" with "multipleValues: false". Only outer value set.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'collection1',
							name: 'collection1',
							type: 'collection',
							default: {},
							options: [
								{
									displayName: 'string1',
									name: 'string1',
									type: 'string',
									default: 'default string1',
								},
								{
									displayName: 'string2',
									name: 'string2',
									type: 'string',
									default: 'default string2',
								},
							],
						},
					],
					nodeValues: {
						collection1: {},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							collection1: {},
						},
						defaultsTrue: {
							collection1: {},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							collection1: {},
						},
						defaultsTrue: {
							collection1: {},
						},
					},
				},
			},
			{
				description: 'complex type "collection" with "multipleValues: false". No value set at all.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'collection1',
							name: 'collection1',
							type: 'collection',
							default: {},
							options: [
								{
									displayName: 'string1',
									name: 'string1',
									type: 'string',
									default: 'default string1',
								},
								{
									displayName: 'string2',
									name: 'string2',
									type: 'string',
									default: 'default string2',
								},
							],
						},
					],
					nodeValues: {},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							collection1: {},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {
							collection1: {},
						},
					},
				},
			},
			{
				description: 'complex type "collection" with "multipleValues: true". No value set at all.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'collection1',
							name: 'collection1',
							type: 'collection',
							typeOptions: {
								multipleValues: true,
							},
							default: [],
							options: [
								{
									displayName: 'string1',
									name: 'string1',
									type: 'string',
									default: 'default string1',
								},
								{
									displayName: 'string2',
									name: 'string2',
									type: 'string',
									default: 'default string2',
								},
							],
						},
					],
					nodeValues: {},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							collection1: [],
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {
							collection1: [],
						},
					},
				},
			},
			{
				description:
					'two identically named properties of which only one gets displayed with different options. No value set at all.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'mainOption',
							name: 'mainOption',
							type: 'options',
							options: [
								{
									name: 'option1',
									value: 'option1',
								},
								{
									name: 'option2',
									value: 'option2',
								},
							],
							default: 'option1',
						},
						{
							displayName: 'subOption',
							name: 'subOption',
							type: 'options',
							displayOptions: {
								show: {
									mainOption: ['option1'],
								},
							},
							options: [
								{
									name: 'option1a',
									value: 'option1a',
								},
								{
									name: 'option1b',
									value: 'option1b',
								},
							],
							default: 'option1a',
						},
						{
							displayName: 'subOption',
							name: 'subOption',
							type: 'options',
							displayOptions: {
								show: {
									mainOption: ['option2'],
								},
							},
							options: [
								{
									name: 'option2a',
									value: 'option2a',
								},
								{
									name: 'option2b',
									value: 'option2b',
								},
							],
							default: 'option2a',
						},
					],
					nodeValues: {},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							mainOption: 'option1',
							subOption: 'option1a',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {
							mainOption: 'option1',
							subOption: 'option1a',
						},
					},
				},
			},
			{
				description:
					'One property which is dependency on two identically named properties of which only one gets displayed with different options. No value set at all.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'mainOption',
							name: 'mainOption',
							type: 'options',
							options: [
								{
									name: 'option1',
									value: 'option1',
								},
								{
									name: 'option2',
									value: 'option2',
								},
							],
							default: 'option1',
						},
						{
							displayName: 'subOption',
							name: 'subOption',
							type: 'options',
							displayOptions: {
								show: {
									mainOption: ['option1'],
								},
							},
							options: [
								{
									name: 'option1a',
									value: 'option1a',
								},
								{
									name: 'option1b',
									value: 'option1b',
								},
							],
							default: 'option1a',
						},
						{
							displayName: 'subOption',
							name: 'subOption',
							type: 'options',
							displayOptions: {
								show: {
									mainOption: ['option2'],
								},
							},
							options: [
								{
									name: 'option2a',
									value: 'option2a',
								},
								{
									name: 'option2b',
									value: 'option2b',
								},
							],
							default: 'option2a',
						},
						{
							displayName: 'dependentParameter',
							name: 'dependentParameter',
							type: 'string',
							default: 'value1',
							required: true,
							displayOptions: {
								show: {
									mainOption: ['option1'],
									subOption: ['option1a'],
								},
							},
						},
						{
							displayName: 'dependentParameter',
							name: 'dependentParameter',
							type: 'string',
							default: 'value2',
							required: true,
							displayOptions: {
								show: {
									mainOption: ['option2'],
									subOption: ['option2a'],
								},
							},
						},
					],
					nodeValues: {},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							mainOption: 'option1',
							subOption: 'option1a',
							dependentParameter: 'value1',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {
							mainOption: 'option1',
							subOption: 'option1a',
							dependentParameter: 'value1',
						},
					},
				},
			},
			{
				description:
					'One property which is dependency on two identically named properties of which only one gets displayed with different options. No value set at all. Order reversed',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'dependentParameter',
							name: 'dependentParameter',
							type: 'string',
							default: 'value2',
							required: true,
							displayOptions: {
								show: {
									mainOption: ['option2'],
									subOption: ['option2a'],
								},
							},
						},
						{
							displayName: 'subOption',
							name: 'subOption',
							type: 'options',
							displayOptions: {
								show: {
									mainOption: ['option2'],
								},
							},
							options: [
								{
									name: 'option2a',
									value: 'option2a',
								},
								{
									name: 'option2b',
									value: 'option2b',
								},
							],
							default: 'option2a',
						},
						{
							displayName: 'subOption',
							name: 'subOption',
							type: 'options',
							displayOptions: {
								show: {
									mainOption: ['option1'],
								},
							},
							options: [
								{
									name: 'option1a',
									value: 'option1a',
								},
								{
									name: 'option1b',
									value: 'option1b',
								},
							],
							default: 'option1a',
						},
						{
							displayName: 'dependentParameter',
							name: 'dependentParameter',
							type: 'string',
							default: 'value1',
							required: true,
							displayOptions: {
								show: {
									mainOption: ['option1'],
									subOption: ['option1a'],
								},
							},
						},
						{
							displayName: 'mainOption',
							name: 'mainOption',
							type: 'options',
							options: [
								{
									name: 'option1',
									value: 'option1',
								},
								{
									name: 'option2',
									value: 'option2',
								},
							],
							default: 'option1',
						},
					],
					nodeValues: {},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {
							mainOption: 'option1',
							subOption: 'option1a',
							dependentParameter: 'value1',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {
							mainOption: 'option1',
							subOption: 'option1a',
							dependentParameter: 'value1',
						},
					},
				},
			},
			{
				description:
					'One property which is dependency on two identically named properties of which only one gets displayed with different options. No value set at all.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'mainOption',
							name: 'mainOption',
							type: 'options',
							options: [
								{
									name: 'option1',
									value: 'option1',
								},
								{
									name: 'option2',
									value: 'option2',
								},
							],
							default: 'option1',
						},
						{
							displayName: 'subOption',
							name: 'subOption',
							type: 'options',
							displayOptions: {
								show: {
									mainOption: ['option1'],
								},
							},
							options: [
								{
									name: 'option1a',
									value: 'option1a',
								},
								{
									name: 'option1b',
									value: 'option1b',
								},
							],
							default: 'option1a',
						},
						{
							displayName: 'subOption',
							name: 'subOption',
							type: 'options',
							displayOptions: {
								show: {
									mainOption: ['option2'],
								},
							},
							options: [
								{
									name: 'option2a',
									value: 'option2a',
								},
								{
									name: 'option2b',
									value: 'option2b',
								},
							],
							default: 'option2a',
						},
						{
							displayName: 'dependentParameter',
							name: 'dependentParameter',
							type: 'string',
							default: 'value1',
							required: true,
							displayOptions: {
								show: {
									mainOption: ['option1'],
									subOption: ['option1a'],
								},
							},
						},
						{
							displayName: 'dependentParameter',
							name: 'dependentParameter',
							type: 'string',
							default: 'value2',
							required: true,
							displayOptions: {
								show: {
									mainOption: ['option2'],
									subOption: ['option2a'],
								},
							},
						},
					],
					nodeValues: {
						mainOption: 'option2',
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							mainOption: 'option2',
						},
						defaultsTrue: {
							mainOption: 'option2',
							subOption: 'option2a',
							dependentParameter: 'value2',
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							mainOption: 'option2',
						},
						defaultsTrue: {
							mainOption: 'option2',
							subOption: 'option2a',
							dependentParameter: 'value2',
						},
					},
				},
			},
			{
				description:
					'complex type "fixedCollection" with "multipleValues: true". Which contains complex type "fixedCollection" with "multipleValues: true". One value set.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'Values1',
							name: 'values1',
							type: 'fixedCollection',
							typeOptions: {
								multipleValues: true,
							},
							description: 'The value to set.',
							default: {},
							options: [
								{
									displayName: 'Options1',
									name: 'options1',
									values: [
										{
											displayName: 'Values2',
											name: 'values2',
											type: 'fixedCollection',
											typeOptions: {
												multipleValues: true,
											},
											description: 'The value to set.',
											default: {},
											options: [
												{
													displayName: 'Options2',
													name: 'options2',
													values: [
														{
															name: 'string1',
															displayName: 'string1',
															type: 'string',
															default: 'default string1',
														},
														{
															name: 'number1',
															displayName: 'number1',
															type: 'number',
															default: 0,
														},
													],
												},
											],
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values1: {
							options1: [
								{
									values2: {
										options2: [
											{
												number1: 1,
											},
										],
									},
								},
							],
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values1: {
								options1: [
									{
										values2: {
											options2: [
												{
													number1: 1,
												},
											],
										},
									},
								],
							},
						},
						defaultsTrue: {
							values1: {
								options1: [
									{
										values2: {
											options2: [
												{
													string1: 'default string1',
													number1: 1,
												},
											],
										},
									},
								],
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values1: {
								options1: [
									{
										values2: {
											options2: [
												{
													number1: 1,
												},
											],
										},
									},
								],
							},
						},
						defaultsTrue: {
							values1: {
								options1: [
									{
										values2: {
											options2: [
												{
													string1: 'default string1',
													number1: 1,
												},
											],
										},
									},
								],
							},
						},
					},
				},
			},
			{
				description:
					'complex type "fixedCollection" with "multipleValues: true". Which contains parameters which get displayed on a parameter with a default expression with relative parameter references.',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'Values1',
							name: 'values1',
							type: 'fixedCollection',
							typeOptions: {
								multipleValues: true,
							},
							description: 'The value to set.',
							default: {},
							options: [
								{
									displayName: 'Options1',
									name: 'options1',
									values: [
										{
											displayName: 'Key',
											name: 'key',
											type: 'string',
											default: '',
										},
										{
											displayName: 'Type',
											name: 'type',
											type: 'hidden',
											default: '={{$parameter["&key"].split("|")[1]}}',
										},
										{
											displayName: 'Title Value',
											name: 'titleValue',
											displayOptions: {
												show: {
													type: ['title'],
												},
											},
											type: 'string',
											default: 'defaultTitle',
										},
										{
											displayName: 'Title Number',
											name: 'numberValue',
											displayOptions: {
												show: {
													type: ['number'],
												},
											},
											type: 'number',
											default: 1,
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values1: {
							options1: [
								{
									key: 'asdf|title',
									titleValue: 'different',
								},
							],
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values1: {
								options1: [
									{
										key: 'asdf|title',
										titleValue: 'different',
									},
								],
							},
						},
						defaultsTrue: {
							values1: {
								options1: [
									{
										key: 'asdf|title',
										type: '={{$parameter["&key"].split("|")[1]}}',
										// This is not great that it displays this theoretically hidden parameter
										// but because we can not resolve the values for now
										numberValue: 1,
										titleValue: 'different',
									},
								],
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values1: {
								options1: [
									{
										key: 'asdf|title',
										titleValue: 'different',
									},
								],
							},
						},
						defaultsTrue: {
							values1: {
								options1: [
									{
										key: 'asdf|title',
										type: '={{$parameter["&key"].split("|")[1]}}',
										titleValue: 'different',
										numberValue: 1,
									},
								],
							},
						},
					},
				},
			},
			{
				description:
					'complex type "fixedCollection" with "multipleValues: true". Which contains parameter of type "multiOptions" and has so an array default value',
				input: {
					nodePropertiesArray: [
						{
							name: 'values',
							displayName: 'Values',
							type: 'fixedCollection',
							typeOptions: {
								multipleValues: true,
							},
							default: {},
							options: [
								{
									name: 'propertyValues',
									displayName: 'Property',
									values: [
										{
											displayName: 'Options',
											name: 'multiSelectValue',
											type: 'multiOptions',
											options: [
												{
													name: 'Value1',
													value: 'value1',
												},
												{
													name: 'Value2',
													value: 'value2',
												},
											],
											default: [],
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values: {
							propertyValues: [
								{
									multiSelectValue: [],
								},
							],
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: {
								propertyValues: [{}],
							},
						},
						defaultsTrue: {
							values: {
								propertyValues: [
									{
										multiSelectValue: [],
									},
								],
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								propertyValues: [{}],
							},
						},
						defaultsTrue: {
							values: {
								propertyValues: [
									{
										multiSelectValue: [],
									},
								],
							},
						},
					},
				},
			},
			{
				description:
					'complex type "fixedCollection" with "multipleValues: true". Which contains parameter of type "string" with "multipleValues: true" and a custom default value',
				input: {
					nodePropertiesArray: [
						{
							name: 'values',
							displayName: 'Values',
							type: 'fixedCollection',
							typeOptions: {
								multipleValues: true,
							},
							default: {},
							options: [
								{
									name: 'propertyValues',
									displayName: 'Property',
									values: [
										{
											displayName: 'MultiString',
											name: 'multiString',
											type: 'string',
											typeOptions: {
												multipleValues: true,
											},
											default: ['value1'],
										},
									],
								},
							],
						},
					],
					nodeValues: {
						values: {
							propertyValues: [
								{
									multiString: ['value1'],
								},
							],
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							values: {
								propertyValues: [{}],
							},
						},
						defaultsTrue: {
							values: {
								propertyValues: [
									{
										multiString: ['value1'],
									},
								],
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							values: {
								propertyValues: [{}],
							},
						},
						defaultsTrue: {
							values: {
								propertyValues: [
									{
										multiString: ['value1'],
									},
								],
							},
						},
					},
				},
			},
			{
				description:
					'complex type "collection" which contains a "fixedCollection" with "multipleValues: false" that has all values set to the default values (by having it as an empty object) in combination with another value',
				input: {
					nodePropertiesArray: [
						{
							name: 'mode',
							displayName: 'mode',
							type: 'string',
							default: 'mode1',
						},
						{
							displayName: 'Options',
							name: 'options',
							placeholder: 'Add Option',
							type: 'collection',
							default: {},
							options: [
								{
									displayName: 'Sort',
									name: 'sort',
									type: 'fixedCollection',
									typeOptions: {
										multipleValues: false,
									},
									default: {},
									placeholder: 'Add Sort',
									options: [
										{
											displayName: 'Sort',
											name: 'value',
											values: [
												{
													displayName: 'Descending',
													name: 'descending',
													type: 'boolean',
													default: true,
													description: 'Sort by descending order',
												},
												{
													displayName: 'Order By',
													name: 'ordering',
													type: 'options',
													default: 'date',
													options: [
														{
															name: 'Date',
															value: 'date',
														},
														{
															name: 'Name',
															value: 'name',
														},
													],
												},
											],
										},
									],
								},
							],
						},
					],
					nodeValues: {
						mode: 'changed',
						options: {
							sort: {
								value: {},
							},
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							mode: 'changed',
							options: {
								sort: {
									value: {},
								},
							},
						},
						defaultsTrue: {
							mode: 'changed',
							options: {
								sort: {
									value: {
										descending: true,
										ordering: 'date',
									},
								},
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							mode: 'changed',
							options: {
								sort: {
									value: {},
								},
							},
						},
						defaultsTrue: {
							mode: 'changed',
							options: {
								sort: {
									value: {
										descending: true,
										ordering: 'date',
									},
								},
							},
						},
					},
				},
			},
			{
				description:
					'complex type "collection" which contains a "fixedCollection" with "multipleValues: false" that has all values set to the default values (by having it as an empty object)',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'Options',
							name: 'options',
							placeholder: 'Add Option',
							type: 'collection',
							default: {},
							options: [
								{
									displayName: 'Sort',
									name: 'sort',
									type: 'fixedCollection',
									typeOptions: {
										multipleValues: false,
									},
									default: {},
									placeholder: 'Add Sort',
									options: [
										{
											displayName: 'Sort',
											name: 'value',
											values: [
												{
													displayName: 'Descending',
													name: 'descending',
													type: 'boolean',
													default: true,
													description: 'Sort by descending order',
												},
												{
													displayName: 'Order By',
													name: 'ordering',
													type: 'options',
													default: 'date',
													options: [
														{
															name: 'Date',
															value: 'date',
														},
														{
															name: 'Name',
															value: 'name',
														},
													],
												},
											],
										},
									],
								},
							],
						},
					],
					nodeValues: {
						options: {
							sort: {
								value: {},
							},
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							options: {
								sort: {
									value: {},
								},
							},
						},
						defaultsTrue: {
							options: {
								sort: {
									value: {
										descending: true,
										ordering: 'date',
									},
								},
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							options: {
								sort: {
									value: {},
								},
							},
						},
						defaultsTrue: {
							options: {
								sort: {
									value: {
										descending: true,
										ordering: 'date',
									},
								},
							},
						},
					},
				},
			},
			{
				description:
					'complex type "collection" which contains a "fixedCollection" with "multipleValues: false" that has all values set to the default values (by having each value set)',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'Options',
							name: 'options',
							placeholder: 'Add Option',
							type: 'collection',
							default: {},
							options: [
								{
									displayName: 'Sort',
									name: 'sort',
									type: 'fixedCollection',
									typeOptions: {
										multipleValues: false,
									},
									default: {},
									options: [
										{
											displayName: 'Sort',
											name: 'value',
											values: [
												{
													displayName: 'Descending',
													name: 'descending',
													type: 'boolean',
													default: true,
												},
												{
													displayName: 'Order By',
													name: 'ordering',
													type: 'options',
													default: 'date',
													options: [
														{
															name: 'Date',
															value: 'date',
														},
														{
															name: 'Name',
															value: 'name',
														},
													],
												},
											],
										},
									],
								},
							],
						},
					],
					nodeValues: {
						options: {
							sort: {
								value: {
									descending: true,
									ordering: 'date',
								},
							},
						},
					},
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {
							options: {
								sort: {
									value: {},
								},
							},
						},
						defaultsTrue: {
							options: {
								sort: {
									value: {
										descending: true,
										ordering: 'date',
									},
								},
							},
						},
					},
					noneDisplayedTrue: {
						defaultsFalse: {
							options: {
								sort: {
									value: {},
								},
							},
						},
						defaultsTrue: {
							options: {
								sort: {
									value: {
										descending: true,
										ordering: 'date',
									},
								},
							},
						},
					},
				},
			},
			{
				description: 'nodeValues is null (for example when resolving expression fails)',
				input: {
					nodePropertiesArray: [
						{
							displayName: 'Custom Properties',
							name: 'customPropertiesUi',
							placeholder: 'Add Custom Property',
							type: 'fixedCollection',
							typeOptions: {
								multipleValues: true,
							},
							default: {},
							options: [
								{
									name: 'customPropertiesValues',
									displayName: 'Custom Property',
									values: [
										{
											displayName: 'Property Name or ID',
											name: 'property',
											type: 'options',
											typeOptions: {
												loadOptionsMethod: 'getDealCustomProperties',
											},
											default: '',
											description:
												'Name of the property. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
										},
										{
											displayName: 'Value',
											name: 'value',
											type: 'string',
											default: '',
											required: true,
											description: 'Value of the property',
										},
									],
								},
							],
						},
					],
					nodeValues: null,
				},
				output: {
					noneDisplayedFalse: {
						defaultsFalse: {},
						defaultsTrue: {},
					},
					noneDisplayedTrue: {
						defaultsFalse: {},
						defaultsTrue: {},
					},
				},
			},
		];

		for (const testData of tests) {
			test(testData.description, () => {
				// returnDefaults: false | returnNoneDisplayed: false
				let result = getNodeParameters(
					testData.input.nodePropertiesArray,
					testData.input.nodeValues,
					false,
					false,
					null,
				);
				expect(result).toEqual(testData.output.noneDisplayedFalse.defaultsFalse);

				// returnDefaults: true | returnNoneDisplayed: false
				result = getNodeParameters(
					testData.input.nodePropertiesArray,
					testData.input.nodeValues,
					true,
					false,
					null,
				);
				expect(result).toEqual(testData.output.noneDisplayedFalse.defaultsTrue);

				// returnDefaults: false | returnNoneDisplayed: true
				result = getNodeParameters(
					testData.input.nodePropertiesArray,
					testData.input.nodeValues,
					false,
					true,
					null,
				);
				expect(result).toEqual(testData.output.noneDisplayedTrue.defaultsFalse);

				// returnDefaults: true | returnNoneDisplayed: true
				result = getNodeParameters(
					testData.input.nodePropertiesArray,
					testData.input.nodeValues,
					true,
					true,
					null,
					null,
				);
				expect(result).toEqual(testData.output.noneDisplayedTrue.defaultsTrue);
			});
		}
	});

	describe('getNodeHints', () => {
		//TODO: Add more tests here when hints are added to some node types
		test('should return node hints if present in node type', () => {
			const testType = {
				hints: [
					{
						message: 'TEST HINT',
					},
				],
			} as INodeTypeDescription;

			const workflow = {} as unknown as Workflow;

			const node: INode = {
				name: 'Test Node Hints',
			} as INode;
			const nodeType = testType;

			const hints = getNodeHints(workflow, node, nodeType);

			expect(hints).toHaveLength(1);
			expect(hints[0].message).toEqual('TEST HINT');
		});
		test('should not include hint if displayCondition is false', () => {
			const testType = {
				hints: [
					{
						message: 'TEST HINT',
						displayCondition: 'FALSE DISPLAY CONDITION EXPESSION',
					},
				],
			} as INodeTypeDescription;

			const workflow = {
				expression: {
					getSimpleParameterValue(
						_node: string,
						_parameter: string,
						_mode: string,
						_additionalData = {},
					) {
						return false;
					},
				},
			} as unknown as Workflow;

			const node: INode = {
				name: 'Test Node Hints',
			} as INode;
			const nodeType = testType;

			const hints = getNodeHints(workflow, node, nodeType);

			expect(hints).toHaveLength(0);
		});
		test('should include hint if displayCondition is true', () => {
			const testType = {
				hints: [
					{
						message: 'TEST HINT',
						displayCondition: 'TRUE DISPLAY CONDITION EXPESSION',
					},
				],
			} as INodeTypeDescription;

			const workflow = {
				expression: {
					getSimpleParameterValue(
						_node: string,
						_parameter: string,
						_mode: string,
						_additionalData = {},
					) {
						return true;
					},
				},
			} as unknown as Workflow;

			const node: INode = {
				name: 'Test Node Hints',
			} as INode;
			const nodeType = testType;

			const hints = getNodeHints(workflow, node, nodeType);

			expect(hints).toHaveLength(1);
		});
	});

	describe('isSubNodeType', () => {
		const tests: Array<[boolean, Pick<INodeTypeDescription, 'outputs'> | null]> = [
			[false, null],
			[false, { outputs: '={{random_expression}}' }],
			[false, { outputs: [] }],
			[false, { outputs: [NodeConnectionTypes.Main] }],
			[true, { outputs: [NodeConnectionTypes.AiAgent] }],
			[true, { outputs: [NodeConnectionTypes.Main, NodeConnectionTypes.AiAgent] }],
		];
		test.each(tests)('should return %p for %o', (expected, nodeType) => {
			expect(isSubNodeType(nodeType)).toBe(expected);
		});
	});

	describe('applyDeclarativeNodeOptionParameters', () => {
		test.each([
			[
				'node with execute method',
				{
					execute: jest.fn(),
					description: {
						properties: [],
					},
				},
			],
			[
				'node with trigger method',
				{
					trigger: jest.fn(),
					description: {
						properties: [],
					},
				},
			],
			[
				'node with webhook method',
				{
					webhook: jest.fn(),
					description: {
						properties: [],
					},
				},
			],
			[
				'a polling node-type',
				{
					description: {
						polling: true,
						properties: [],
					},
				},
			],
			[
				'a node-type with a non-main output',
				{
					description: {
						outputs: ['main', 'ai_agent'],
						properties: [],
					},
				},
			],
		])('should not modify properties on node with %s method', (_, nodeTypeName) => {
			const nodeType = nodeTypeName as unknown as INodeType;
			applyDeclarativeNodeOptionParameters(nodeType);
			expect(nodeType.description.properties).toEqual([]);
		});
	});

	describe('getParameterIssues', () => {
		const tests: Array<{
			description: string;
			input: {
				nodeProperties: INodeProperties;
				nodeValues: INodeParameters;
				path: string;
				node: INode;
			};
			output: INodeIssues;
		}> = [
			{
				description:
					'Fixed collection::Should not return issues if minimum or maximum field count is not set',
				input: {
					nodeProperties: {
						displayName: 'Workflow Inputs',
						name: 'workflowInputs',
						placeholder: 'Add Field',
						type: 'fixedCollection',
						description:
							'Define expected input fields. If no inputs are provided, all data from the calling workflow will be passed through.',
						typeOptions: {
							multipleValues: true,
							sortable: true,
						},
						displayOptions: {
							show: {
								'@version': [
									{
										_cnd: {
											gte: 1.1,
										},
									},
								],
								inputSource: ['workflowInputs'],
							},
						},
						default: {},
						options: [
							{
								name: 'values',
								displayName: 'Values',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										placeholder: 'e.g. fieldName',
										description: 'Name of the field',
										noDataExpression: true,
									},
									{
										displayName: 'Type',
										name: 'type',
										type: 'options',
										description: 'The field value type',
										options: [
											{
												name: 'Allow Any Type',
												value: 'any',
											},
											{
												name: 'String',
												value: 'string',
											},
											{
												name: 'Number',
												value: 'number',
											},
											{
												name: 'Boolean',
												value: 'boolean',
											},
											{
												name: 'Array',
												value: 'array',
											},
											{
												name: 'Object',
												value: 'object',
											},
										],
										default: 'string',
										noDataExpression: true,
									},
								],
							},
						],
					},
					nodeValues: {
						events: 'worklfow_call',
						inputSource: 'workflowInputs',
						workflowInputs: {},
						inputOptions: {},
					},
					path: '',
					node: {
						parameters: {
							events: 'worklfow_call',
							inputSource: 'workflowInputs',
							workflowInputs: {},
							inputOptions: {},
						},
						type: 'n8n-nodes-base.executeWorkflowTrigger',
						typeVersion: 1.1,
						position: [-140, -20],
						id: '9abdbdac-5f32-4876-b4d5-895d8ca4cb00',
						name: 'Test Node',
					} as INode,
				},
				output: {},
			},
			{
				description:
					'Fixed collection::Should not return issues if field count is within the specified range',
				input: {
					nodeProperties: {
						displayName: 'Workflow Inputs',
						name: 'workflowInputs',
						placeholder: 'Add Field',
						type: 'fixedCollection',
						description:
							'Define expected input fields. If no inputs are provided, all data from the calling workflow will be passed through.',
						typeOptions: {
							multipleValues: true,
							sortable: true,
							minRequiredFields: 1,
							maxAllowedFields: 3,
						},
						displayOptions: {
							show: {
								'@version': [
									{
										_cnd: {
											gte: 1.1,
										},
									},
								],
								inputSource: ['workflowInputs'],
							},
						},
						default: {},
						options: [
							{
								name: 'values',
								displayName: 'Values',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										placeholder: 'e.g. fieldName',
										description: 'Name of the field',
										noDataExpression: true,
									},
									{
										displayName: 'Type',
										name: 'type',
										type: 'options',
										description: 'The field value type',
										options: [
											{
												name: 'Allow Any Type',
												value: 'any',
											},
											{
												name: 'String',
												value: 'string',
											},
											{
												name: 'Number',
												value: 'number',
											},
											{
												name: 'Boolean',
												value: 'boolean',
											},
											{
												name: 'Array',
												value: 'array',
											},
											{
												name: 'Object',
												value: 'object',
											},
										],
										default: 'string',
										noDataExpression: true,
									},
								],
							},
						],
					},
					nodeValues: {
						events: 'worklfow_call',
						inputSource: 'workflowInputs',
						workflowInputs: {
							values: [
								{
									name: 'field1',
									type: 'string',
								},
								{
									name: 'field2',
									type: 'string',
								},
							],
						},
						inputOptions: {},
					},
					path: '',
					node: {
						parameters: {
							events: 'worklfow_call',
							inputSource: 'workflowInputs',
							workflowInputs: {},
							inputOptions: {},
						},
						type: 'n8n-nodes-base.executeWorkflowTrigger',
						typeVersion: 1.1,
						position: [-140, -20],
						id: '9abdbdac-5f32-4876-b4d5-895d8ca4cb00',
						name: 'Test Node',
					} as INode,
				},
				output: {},
			},
			{
				description:
					'Fixed collection::Should return an issue if field count is lower than minimum specified',
				input: {
					nodeProperties: {
						displayName: 'Workflow Inputs',
						name: 'workflowInputs',
						placeholder: 'Add Field',
						type: 'fixedCollection',
						description:
							'Define expected input fields. If no inputs are provided, all data from the calling workflow will be passed through.',
						typeOptions: {
							multipleValues: true,
							sortable: true,
							minRequiredFields: 1,
						},
						displayOptions: {
							show: {
								'@version': [
									{
										_cnd: {
											gte: 1.1,
										},
									},
								],
								inputSource: ['workflowInputs'],
							},
						},
						default: {},
						options: [
							{
								name: 'values',
								displayName: 'Values',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										placeholder: 'e.g. fieldName',
										description: 'Name of the field',
										noDataExpression: true,
									},
									{
										displayName: 'Type',
										name: 'type',
										type: 'options',
										description: 'The field value type',
										options: [
											{
												name: 'Allow Any Type',
												value: 'any',
											},
											{
												name: 'String',
												value: 'string',
											},
											{
												name: 'Number',
												value: 'number',
											},
											{
												name: 'Boolean',
												value: 'boolean',
											},
											{
												name: 'Array',
												value: 'array',
											},
											{
												name: 'Object',
												value: 'object',
											},
										],
										default: 'string',
										noDataExpression: true,
									},
								],
							},
						],
					},
					nodeValues: {
						events: 'worklfow_call',
						inputSource: 'workflowInputs',
						workflowInputs: {},
						inputOptions: {},
					},
					path: '',
					node: {
						parameters: {
							events: 'worklfow_call',
							inputSource: 'workflowInputs',
							workflowInputs: {},
							inputOptions: {},
						},
						type: 'n8n-nodes-base.executeWorkflowTrigger',
						typeVersion: 1.1,
						position: [-140, -20],
						id: '9abdbdac-5f32-4876-b4d5-895d8ca4cb00',
						name: 'Test Node',
					} as INode,
				},
				output: {
					parameters: {
						workflowInputs: ['At least 1 field is required.'],
					},
				},
			},
			{
				description:
					'Fixed collection::Should return an issue if field count is higher than maximum specified',
				input: {
					nodeProperties: {
						displayName: 'Workflow Inputs',
						name: 'workflowInputs',
						placeholder: 'Add Field',
						type: 'fixedCollection',
						description:
							'Define expected input fields. If no inputs are provided, all data from the calling workflow will be passed through.',
						typeOptions: {
							multipleValues: true,
							sortable: true,
							maxAllowedFields: 1,
						},
						displayOptions: {
							show: {
								'@version': [
									{
										_cnd: {
											gte: 1.1,
										},
									},
								],
								inputSource: ['workflowInputs'],
							},
						},
						default: {},
						options: [
							{
								name: 'values',
								displayName: 'Values',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										placeholder: 'e.g. fieldName',
										description: 'Name of the field',
										noDataExpression: true,
									},
									{
										displayName: 'Type',
										name: 'type',
										type: 'options',
										description: 'The field value type',
										options: [
											{
												name: 'Allow Any Type',
												value: 'any',
											},
											{
												name: 'String',
												value: 'string',
											},
											{
												name: 'Number',
												value: 'number',
											},
											{
												name: 'Boolean',
												value: 'boolean',
											},
											{
												name: 'Array',
												value: 'array',
											},
											{
												name: 'Object',
												value: 'object',
											},
										],
										default: 'string',
										noDataExpression: true,
									},
								],
							},
						],
					},
					nodeValues: {
						events: 'worklfow_call',
						inputSource: 'workflowInputs',
						workflowInputs: {
							values: [
								{
									name: 'field1',
									type: 'string',
								},
								{
									name: 'field2',
									type: 'string',
								},
							],
						},
						inputOptions: {},
					},
					path: '',
					node: {
						parameters: {
							events: 'worklfow_call',
							inputSource: 'workflowInputs',
							workflowInputs: {},
							inputOptions: {},
						},
						type: 'n8n-nodes-base.executeWorkflowTrigger',
						typeVersion: 1.1,
						position: [-140, -20],
						id: '9abdbdac-5f32-4876-b4d5-895d8ca4cb00',
						name: 'Test Node',
					} as INode,
				},
				output: {
					parameters: {
						workflowInputs: ['At most 1 field is allowed.'],
					},
				},
			},
			{
				description: 'Fixed collection::Should not return issues if the collection is hidden',
				input: {
					nodeProperties: {
						displayName: 'Workflow Inputs',
						name: 'workflowInputs',
						placeholder: 'Add Field',
						type: 'fixedCollection',
						description:
							'Define expected input fields. If no inputs are provided, all data from the calling workflow will be passed through.',
						typeOptions: {
							multipleValues: true,
							sortable: true,
							maxAllowedFields: 1,
						},
						displayOptions: {
							show: {
								'@version': [
									{
										_cnd: {
											gte: 1.1,
										},
									},
								],
								inputSource: ['workflowInputs'],
							},
						},
						default: {},
						options: [
							{
								name: 'values',
								displayName: 'Values',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										placeholder: 'e.g. fieldName',
										description: 'Name of the field',
										noDataExpression: true,
									},
									{
										displayName: 'Type',
										name: 'type',
										type: 'options',
										description: 'The field value type',
										options: [
											{
												name: 'Allow Any Type',
												value: 'any',
											},
											{
												name: 'String',
												value: 'string',
											},
											{
												name: 'Number',
												value: 'number',
											},
											{
												name: 'Boolean',
												value: 'boolean',
											},
											{
												name: 'Array',
												value: 'array',
											},
											{
												name: 'Object',
												value: 'object',
											},
										],
										default: 'string',
										noDataExpression: true,
									},
								],
							},
						],
					},
					nodeValues: {
						events: 'worklfow_call',
						inputSource: 'somethingElse',
						workflowInputs: {
							values: [
								{
									name: 'field1',
									type: 'string',
								},
								{
									name: 'field2',
									type: 'string',
								},
							],
						},
						inputOptions: {},
					},
					path: '',
					node: {
						parameters: {
							events: 'worklfow_call',
							inputSource: 'workflowInputs',
							workflowInputs: {},
							inputOptions: {},
						},
						type: 'n8n-nodes-base.executeWorkflowTrigger',
						typeVersion: 1.1,
						position: [-140, -20],
						id: '9abdbdac-5f32-4876-b4d5-895d8ca4cb00',
						name: 'Test Node',
					} as INode,
				},
				output: {},
			},
		];

		for (const testData of tests) {
			test(testData.description, () => {
				const result = getParameterIssues(
					testData.input.nodeProperties,
					testData.input.nodeValues,
					testData.input.path,
					testData.input.node,
				);
				expect(result).toEqual(testData.output);
			});
		}
	});

	describe('getParameterIssues, required parameters validation', () => {
		const testNode: INode = {
			id: '12345',
			name: 'Test Node',
			typeVersion: 1,
			type: 'n8n-nodes-base.testNode',
			position: [1, 1],
			parameters: {},
		};

		const testNodeType: INodeTypeDescription = {
			name: 'Test Node',
			version: 0,
			defaults: {},
			inputs: [],
			outputs: [],
			properties: [],
			displayName: '',
			group: [],
			description: '',
		};

		it('Should validate required dateTime parameters if empty string', () => {
			const nodeProperties: INodeProperties = {
				displayName: 'Date Time',
				name: 'testDateTime',
				type: 'dateTime',
				default: '',
				required: true,
			};
			const nodeValues: INodeParameters = {
				testDateTime: '',
			};

			const result = getParameterIssues(nodeProperties, nodeValues, '', testNode, null);

			expect(result).toEqual({
				parameters: {
					testDateTime: ['Parameter "Date Time" is required.'],
				},
			});
		});

		it('Should validate required dateTime parameters if empty undefined', () => {
			const nodeProperties: INodeProperties = {
				displayName: 'Date Time',
				name: 'testDateTime',
				type: 'dateTime',
				default: '',
				required: true,
			};
			const nodeValues: INodeParameters = {
				testDateTime: undefined,
			};

			const result = getParameterIssues(nodeProperties, nodeValues, '', testNode, testNodeType);

			expect(result).toEqual({
				parameters: {
					testDateTime: ['Parameter "Date Time" is required.'],
				},
			});
		});
	});

	describe('isTriggerNode', () => {
		const tests: Array<{
			description: string;
			input: INodeTypeDescription;
			expected: boolean;
		}> = [
			{
				description: 'Should return true for node with trigger in group',
				input: {
					name: 'TriggerNode',
					displayName: 'Trigger Node',
					group: ['trigger'],
					description: 'Trigger node description',
					version: 1,
					defaults: {},
					inputs: [],
					outputs: [NodeConnectionTypes.Main],
					properties: [],
				},
				expected: true,
			},
			{
				description: 'Should return true for node with multiple groups including trigger',
				input: {
					name: 'MultiGroupTriggerNode',
					displayName: 'Multi-Group Trigger Node',
					group: ['trigger', 'input'],
					description: 'Multi-group trigger node description',
					version: 1,
					defaults: {},
					inputs: [],
					outputs: [NodeConnectionTypes.Main],
					properties: [],
				},
				expected: true,
			},
			{
				description: 'Should return false for node without trigger in group',
				input: {
					name: 'RegularNode',
					displayName: 'Regular Node',
					group: ['input'],
					description: 'Regular node description',
					version: 1,
					defaults: {},
					inputs: [NodeConnectionTypes.Main],
					outputs: [NodeConnectionTypes.Main],
					properties: [],
				},
				expected: false,
			},
			{
				description: 'Should return false for node with empty group array',
				input: {
					name: 'EmptyGroupNode',
					displayName: 'Empty Group Node',
					group: [],
					description: 'Empty group node description',
					version: 1,
					defaults: {},
					inputs: [NodeConnectionTypes.Main],
					outputs: [NodeConnectionTypes.Main],
					properties: [],
				},
				expected: false,
			},
			{
				description:
					'Should return false when trigger is called Trigger, but does not have a trigger group',
				input: {
					name: 'AlmostTriggerNode',
					displayName: 'Almost Trigger Node',
					group: ['transform'],
					description: 'Almost trigger node description',
					version: 1,
					defaults: {},
					inputs: [NodeConnectionTypes.Main],
					outputs: [NodeConnectionTypes.Main],
					properties: [],
				},
				expected: false,
			},
		];

		for (const testData of tests) {
			test(testData.description, () => {
				const result = isTriggerNode(testData.input);
				expect(result).toEqual(testData.expected);
			});
		}
	});

	describe('isExecutable', () => {
		const workflowMock = {
			expression: {
				getSimpleParameterValue: jest.fn().mockReturnValue([NodeConnectionTypes.Main]),
			},
		} as unknown as Workflow;

		const tests: Array<{
			description: string;
			node: INode;
			nodeTypeData: INodeTypeDescription;
			expected: boolean;
			mockReturnValue?: NodeConnectionType[];
		}> = [
			{
				description: 'Should return true for trigger node',
				node: {
					id: 'triggerNodeId',
					name: 'TriggerNode',
					position: [0, 0],
					type: 'n8n-nodes-base.TriggerNode',
					typeVersion: 1,
					parameters: {},
				},
				nodeTypeData: {
					name: 'TriggerNode',
					displayName: 'Trigger Node',
					group: ['trigger'],
					description: 'Trigger node description',
					version: 1,
					defaults: {},
					inputs: [],
					outputs: [NodeConnectionTypes.Main],
					properties: [],
				},
				expected: true,
			},
			{
				description: 'Should return true for node with Main output',
				node: {
					id: 'mainOutputNodeId',
					name: 'MainOutputNode',
					position: [0, 0],
					type: 'n8n-nodes-base.MainOutputNode',
					typeVersion: 1,
					parameters: {},
				},
				nodeTypeData: {
					name: 'MainOutputNode',
					displayName: 'Main Output Node',
					group: ['transform'],
					description: 'Node with Main output',
					version: 1,
					defaults: {},
					inputs: [NodeConnectionTypes.Main],
					outputs: [NodeConnectionTypes.Main],
					properties: [],
				},
				expected: true,
			},
			{
				description: 'Should return false for node without Main output and not a trigger',
				node: {
					id: 'nonExecutableNodeId',
					name: 'NonExecutableNode',
					position: [0, 0],
					type: 'n8n-nodes-base.NonExecutableNode',
					typeVersion: 1,
					parameters: {},
				},
				nodeTypeData: {
					name: 'NonExecutableNode',
					displayName: 'Non-Executable Node',
					group: ['output'],
					description: 'Node without Main output and not a trigger',
					version: 1,
					defaults: {},
					inputs: [NodeConnectionTypes.Main],
					outputs: [NodeConnectionTypes.AiAgent],
					properties: [],
				},
				expected: false,
			},
			{
				description: 'Should return true for node with mixed outputs including Main',
				node: {
					id: 'mixedOutputNodeId',
					name: 'MixedOutputNode',
					position: [0, 0],
					type: 'n8n-nodes-base.MixedOutputNode',
					typeVersion: 1,
					parameters: {},
				},
				nodeTypeData: {
					name: 'MixedOutputNode',
					displayName: 'Mixed Output Node',
					group: ['transform'],
					description: 'Node with multiple output types including Main',
					version: 1,
					defaults: {},
					inputs: [NodeConnectionTypes.Main],
					outputs: [NodeConnectionTypes.Main, NodeConnectionTypes.AiAgent],
					properties: [],
				},
				expected: true,
			},
			{
				description: 'Should return false for node with only AiTool output and not a trigger',
				node: {
					id: 'aiToolOutputNodeId',
					name: 'AiToolOutputNode',
					position: [0, 0],
					type: 'n8n-nodes-base.AiToolOutputNode',
					typeVersion: 1,
					parameters: {},
				},
				nodeTypeData: {
					name: 'AiToolOutputNode',
					displayName: 'AI Tool Output Node',
					group: ['output'],
					description: 'Node with only AiTool output and not a trigger',
					version: 1,
					defaults: {},
					inputs: [],
					outputs: [NodeConnectionTypes.AiTool], // Only AiTool output, no Main
					properties: [],
				},
				expected: false,
			},
			{
				description: 'Should return false for node with dynamic outputs set to AiTool only',
				node: {
					id: 'dynamicAiToolNodeId',
					name: 'DynamicAiToolNode',
					position: [0, 0],
					type: 'n8n-nodes-base.DynamicAiToolNode',
					typeVersion: 1,
					parameters: {},
				},
				nodeTypeData: {
					name: 'DynamicAiToolNode',
					displayName: 'Dynamic AiTool Node',
					group: ['output'],
					description: 'Node with dynamic outputs that resolve to only AiTool',
					version: 1,
					defaults: {},
					inputs: [NodeConnectionTypes.Main],
					outputs: '={{["ai_tool"]}}', // Dynamic expression that resolves to AiTool only
					properties: [],
				},
				expected: false,
				mockReturnValue: [NodeConnectionTypes.AiTool],
			},
		];

		for (const testData of tests) {
			test(testData.description, () => {
				// If this test has a custom mock return value, configure it
				if (testData.mockReturnValue) {
					(workflowMock.expression.getSimpleParameterValue as jest.Mock).mockReturnValueOnce(
						testData.mockReturnValue,
					);
				}

				const result = isExecutable(workflowMock, testData.node, testData.nodeTypeData);
				expect(result).toEqual(testData.expected);
			});
		}
	});
});
describe('displayParameter', () => {
	const testNode: INode = {
		id: '12345',
		name: 'Test Node',
		typeVersion: 1,
		type: 'n8n-nodes-base.testNode',
		position: [1, 1],
		parameters: {},
	};

	const testNodeType: INodeTypeDescription = {
		name: 'Test Node',
		version: 0,
		defaults: {},
		inputs: [],
		outputs: [],
		properties: [],
		displayName: '',
		group: [],
		description: '',
	};

	const defaultTestInput = {
		nodeValues: {},
		parameter: {
			displayName: 'Test Parameter',
			name: 'testParameter',
			type: 'string',
			default: '',
		} as INodeProperties,
		node: testNode,
		nodeTypeDescription: testNodeType,
		nodeValuesRoot: undefined as undefined | INodeParameters,
		displayKey: 'displayOptions' as 'displayOptions' | 'disabledOptions',
	};

	const tests: Array<[string, typeof defaultTestInput, boolean]> = [
		['Should return true if no displayOptions are defined', { ...defaultTestInput }, true],
		[
			'Should return true if displayOptions.show conditions are met',
			{
				...defaultTestInput,
				nodeValues: { condition: 'value1' },
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						show: {
							condition: ['value1'],
						},
					},
				},
			},
			true,
		],
		[
			'Should return false if displayOptions.show conditions are not met',
			{
				...defaultTestInput,
				nodeValues: { condition: 'value2' },
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						show: {
							condition: ['value1'],
						},
					},
				},
			},
			false,
		],
		[
			'Should return false if displayOptions.hide conditions are met',
			{
				...defaultTestInput,
				nodeValues: { condition: 'value1' },
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						hide: {
							condition: ['value1'],
						},
					},
				},
			},
			false,
		],
		[
			'Should return true if displayOptions.hide conditions are not met',
			{
				...defaultTestInput,
				nodeValues: { condition: 'value2' },
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						hide: {
							condition: ['value1'],
						},
					},
				},
			},
			true,
		],
		[
			'Should return true if displayOptions.show and hide conditions are both met',
			{
				...defaultTestInput,
				nodeValues: { condition: 'value1' },
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						show: {
							condition: ['value1'],
						},
						hide: {
							condition: ['value1'],
						},
					},
				},
			},
			false, // Hide takes precedence over show
		],
		[
			'Should return true if displayOptions.show conditions are met with multiple values',
			{
				...defaultTestInput,
				nodeValues: { condition: 'value2' },
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						show: {
							condition: ['value1', 'value2'],
						},
					},
				},
			},
			true,
		],
		[
			'Should return false if displayOptions.hide conditions are met with multiple values',
			{
				...defaultTestInput,
				nodeValues: { condition: 'value2' },
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						hide: {
							condition: ['value1', 'value2'],
						},
					},
				},
			},
			false,
		],
		[
			'Should return true if @tool is true in nodeTypeDescription of tool',
			{
				...defaultTestInput,
				nodeTypeDescription: {
					...testNodeType,
					codex: {
						subcategories: {
							AI: ['Tools'],
						},
					},
				},
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						show: {
							'@tool': [true],
						},
					},
				},
			},
			true,
		],
		[
			'Should return false if @tool is true in nodeTypeDescription of non-tool',
			{
				...defaultTestInput,
				nodeTypeDescription: {
					...testNodeType,
					codex: {
						subcategories: {
							AI: [],
						},
					},
				},
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						show: {
							'@tool': [true],
						},
					},
				},
			},
			false,
		],
		[
			'Should return true if @version condition is met',
			{
				...defaultTestInput,
				node: {
					...testNode,
					typeVersion: 2,
				},
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						show: {
							'@version': [
								{
									_cnd: {
										gte: 2,
									},
								},
							],
						},
					},
				},
			},
			true,
		],
		[
			'Should return false if @version condition is not met',
			{
				...defaultTestInput,
				node: {
					...testNode,
					typeVersion: 1,
				},
				parameter: {
					...defaultTestInput.parameter,
					displayOptions: {
						show: {
							'@version': [
								{
									_cnd: {
										gte: 2,
									},
								},
							],
						},
					},
				},
			},
			false,
		],
		[
			'Should return true if no disabledOptions are defined',
			{
				...defaultTestInput,
				displayKey: 'disabledOptions',
			},
			true,
		],
		[
			'Should return false if disabledOptions.hide conditions are met',
			{
				...defaultTestInput,
				nodeValues: { condition: 'value1' },
				parameter: {
					...defaultTestInput.parameter,
					disabledOptions: {
						hide: {
							condition: ['value1'],
						},
					},
				},
				displayKey: 'disabledOptions',
			},
			false,
		],
		[
			'Should return true if disabledOptions.hide conditions are not met',
			{
				...defaultTestInput,
				nodeValues: { condition: 'value2' },
				parameter: {
					...defaultTestInput.parameter,
					disabledOptions: {
						hide: {
							condition: ['value1'],
						},
					},
				},
				displayKey: 'disabledOptions',
			},
			true,
		],
	];

	for (const [description, input, expected] of tests) {
		test(description, () => {
			const result = displayParameter(
				input.nodeValues,
				input.parameter,
				input.node,
				input.nodeTypeDescription,
				input.nodeValuesRoot,
				input.displayKey,
			);
			expect(result).toEqual(expected);
		});
	}
});
