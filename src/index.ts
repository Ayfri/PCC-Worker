import { ScheduledEvent, ExecutionContext, fetch, console } from '@cloudflare/workers-types';

interface Env {
	// If you want to secure the call with a secret (recommended)
	// CRON_SECRET: string;
	PAGES_FUNCTION_URL: string; // e.g., 'https://yourproject.pages.dev/regenerate-assets'
	PCC_TOKEN: string;
}

export default {
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		console.log('Cron Triggered: Calling Pages Function to regenerate assets.');

		try {
			const response = await fetch(env.PAGES_FUNCTION_URL, {
				method: 'POST', // Or 'GET' if your function doesn't modify anything (but here it does)
				headers: {
					'PCC_TOKEN': env.PCC_TOKEN,
				},
			});

			if (response.ok) {
				console.log('Successfully triggered Pages Function:', await response.json());
			} else {
				console.error('Failed to trigger Pages Function:', response.status, await response.text());
			}
		} catch (error) {
			console.error('Error fetching Pages Function:', error);
		}
	},
};
