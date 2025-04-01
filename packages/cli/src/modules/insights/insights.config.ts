import { Config, Env } from '@n8n/config';

@Config
export class InsightsConfig {
	/**
	 * The interval in minutes at which the insights data should be compacted.
	 * Default: 60
	 */
	@Env('N8N_INSIGHTS_COMPACTION_INTERVAL_MINUTES')
	compactionIntervalMinutes: number = 60;

	/**
	 * The number of raw insights data to compact in a single batch.
	 * Default: 500
	 */
	@Env('N8N_INSIGHTS_COMPACTION_BATCH_SIZE')
	compactionBatchSize: number = 500;

	/**
	 * The maximum number of insights data to keep in the buffer before flushing.
	 * Default: 100
	 */
	@Env('N8N_INSIGHTS_FLUSH_BATCH_SIZE')
	flushBatchSize: number = 100;

	/**
	 * The interval in seconds at which the insights data should be flushed to the database.
	 * Default: 30
	 */
	@Env('N8N_INSIGHTS_FLUSH_INTERVAL_SECONDS')
	flushIntervalSeconds: number = 30;
}
