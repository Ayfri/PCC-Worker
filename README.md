# PCC-Worker: Cloudflare Cron Trigger Worker

This project is a Cloudflare Worker designed to act as a cron trigger. Its primary purpose is to periodically invoke a Cloudflare Pages Function, specifically one that handles the regeneration of assets for another project.

## Features

-   Scheduled execution via Cloudflare Cron Triggers.
-   Invokes a specified Cloudflare Pages Function URL.
-   Configurable via `wrangler.toml` and environment variables.
-   Includes an optional mechanism for securing the trigger endpoint using a shared secret.

## Project Structure

```
PCC-Worker/
├── src/
│   └── index.ts        # Main worker script
├── .gitignore          # Specifies intentionally untracked files
├── LICENSE             # Project license (GPL-3.0)
├── package.json        # Project dependencies and scripts
├── pnpm-lock.yaml      # PNPM lockfile
├── pnpm-workspace.yaml # PNPM workspace configuration (if part of a monorepo)
├── README.md           # This file
├── tsconfig.json       # TypeScript configuration
└── wrangler.toml       # Wrangler configuration for Cloudflare Worker
```

## Prerequisites

-   Node.js (preferably a recent LTS version)
-   PNPM package manager (https://pnpm.io/)
-   A Cloudflare account.
-   `wrangler` CLI installed and configured (usually handled as a dev dependency via PNPM).

## Setup and Configuration

1.  **Clone the repository (if you haven't already):**
    ```bash
    # If applicable, otherwise you already have the project
    # git clone <repository-url>
    # cd PCC-Worker
    ```

2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

3.  **Configure `wrangler.toml`:**
    Open the `wrangler.toml` file and customize the following:
    -   `name`: You can change the worker name if desired (e.g., `"my-cron-worker"`).
    -   `compatibility_date`: Update to a recent date if necessary.
    -   **`[vars]` section:**
        -   `PAGES_FUNCTION_URL`: **Crucial.** Set this to the full URL of your Cloudflare Pages Function that needs to be triggered.
            Example: `PAGES_FUNCTION_URL = "https://your-pages-project.pages.dev/regenerate-assets"`
        -   `CRON_SECRET` (Optional, but Recommended for Security):
            -   If you want to secure the endpoint, uncomment this line and set a strong, unique secret string.
                Example: `CRON_SECRET = "your-very-strong-and-secret-key"`
            -   You will also need to configure your target Pages Function to expect and verify this secret (e.g., via an `X-Custom-Cron-Secret` header).

    -   **`[triggers]` section:**
        -   `crons`: Define the cron schedule for when the worker should run. The default is `["0 3 * * *"]` (every day at 3 AM UTC).
            Refer to the [Cloudflare Cron Triggers documentation](https://developers.cloudflare.com/workers/wrangler/configuration/#triggers) for syntax.

4.  **(Recommended) Secure your Pages Function:**
    If you've set `CRON_SECRET` in `wrangler.toml`:
    *   **In this worker (`src/index.ts`):**
        Uncomment the `headers` section in the `fetch` call to send the secret:
        ```typescript
        // headers: { // Uncomment if you use a secret
        //   'X-Custom-Cron-Secret': env.CRON_SECRET,
        // },
        ```
        Change to:
        ```typescript
        headers: {
          'X-Custom-Cron-Secret': env.CRON_SECRET,
        },
        ```
    *   **In your Cloudflare Pages project (the one hosting the target function):**
        -   Add an environment variable (e.g., `CRON_SHARED_SECRET`) with the *same value* as the `CRON_SECRET` in this worker.
        -   Modify your Pages Function (e.g., `/functions/regenerate-assets.ts`) to check for the `X-Custom-Cron-Secret` header and validate its value against `context.env.CRON_SHARED_SECRET`. If it doesn't match or is missing, return an unauthorized response.

## Usage

1.  **Type Checking (Optional but Recommended):**
    ```bash
    pnpm typecheck
    ```

2.  **Local Development (Simulating Cron):**
    While `wrangler dev` can run the worker, cron triggers are not directly simulated locally in the same way they run on Cloudflare. You can test the worker's `fetch` logic by manually triggering it or adapting the script for local testing if needed.
    ```bash
    # Starts a local server for the worker, but cron won't run automatically
    pnpm dev
    ```

3.  **Deployment:**
    Deploy the worker to your Cloudflare account:
    ```bash
    pnpm deploy
    ```
    Wrangler will use the settings in `wrangler.toml` to deploy and configure the worker, including setting up the cron trigger.

## Monitoring

Once deployed, you can monitor the worker's execution and logs through the Cloudflare dashboard:
1.  Log in to your Cloudflare account.
2.  Navigate to **Workers & Pages**.
3.  Select your worker (e.g., `pcc-worker-cron-trigger`).
4.  Go to the **Logs** tab to see invocation logs, `console.log` outputs, and any errors.
5.  You can also view trigger history and metrics.

## Contributing

If you wish to contribute, please follow standard Git practices (fork, branch, commit with conventional messages, pull request).

## License

This project is licensed under the [GNU General Public License v3.0](./LICENSE).
