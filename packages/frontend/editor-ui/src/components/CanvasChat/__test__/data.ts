import { createTestNode, createTestWorkflow, mockNodeTypeDescription } from '@/__tests__/mocks';
import { CHAT_TRIGGER_NODE_TYPE, MANUAL_TRIGGER_NODE_TYPE } from '@/constants';
import { type IExecutionResponse } from '@/Interface';
import { WorkflowOperationError } from 'n8n-workflow';

export const nodeTypes = [
	mockNodeTypeDescription({
		name: CHAT_TRIGGER_NODE_TYPE,
		version: 1,
		group: ['trigger'],
	}),
	mockNodeTypeDescription({
		name: MANUAL_TRIGGER_NODE_TYPE,
		version: 1,
		group: ['trigger'],
	}),
];

export const chatTriggerNode = createTestNode({ name: 'Chat', type: CHAT_TRIGGER_NODE_TYPE });
export const manualTriggerNode = createTestNode({ name: 'Manual' });
export const aiAgentNode = createTestNode({ name: 'AI Agent' });
export const aiModelNode = createTestNode({ name: 'AI Model' });

export const simpleWorkflow = createTestWorkflow({
	nodes: [manualTriggerNode],
	connections: {},
});

export const aiChatWorkflow = createTestWorkflow({
	nodes: [chatTriggerNode, aiAgentNode, aiModelNode],
	connections: {
		Chat: {
			main: [[{ node: 'AI Agent', index: 0, type: 'main' }]],
		},
		'AI Model': {
			ai_languageModel: [[{ node: 'AI Agent', index: 0, type: 'ai_languageModel' }]],
		},
	},
});

export const executionResponse: IExecutionResponse = {
	id: 'test-exec-id',
	finished: true,
	mode: 'manual',
	status: 'success',
	data: {
		resultData: {
			runData: {
				'AI Agent': [
					{
						executionStatus: 'success',
						startTime: +new Date('2025-03-26T00:00:00.002Z'),
						executionTime: 1778,
						source: [],
						data: {},
					},
				],
				'AI Model': [
					{
						executionStatus: 'error',
						startTime: +new Date('2025-03-26T00:00:00.003Z'),
						executionTime: 1777,
						source: [],
						error: new WorkflowOperationError('Test error', aiModelNode, 'Test error description'),
						data: {
							ai_languageModel: [
								[
									{
										json: {
											tokenUsage: {
												completionTokens: 222,
												promptTokens: 333,
												totalTokens: 555,
											},
										},
									},
								],
							],
						},
					},
				],
			},
		},
	},
	workflowData: aiChatWorkflow,
	createdAt: new Date('2025-03-26T00:00:00.000Z'),
	startedAt: new Date('2025-03-26T00:00:00.001Z'),
	stoppedAt: new Date('2025-03-26T00:00:02.000Z'),
};
