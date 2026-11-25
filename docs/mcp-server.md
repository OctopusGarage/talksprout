# TalkSprout MCP

A public-content-only, stateless server supplies `get_guide`, `search_documents` and `read_document`. It uses the MCP SDK and Cloudflare Agents handler with Streamable HTTP, JSON responses and stateless legacy client support. Authentication: none; never add private content to this public service.

## Local development

```sh
pnpm install --frozen-lockfile
pnpm sync
pnpm --dir mcp install --frozen-lockfile
pnpm mcp:test
pnpm --dir mcp dev
```

Configure a compatible client with the local development URL printed by the CLI plus `/mcp`. Remote clients cannot reach another machine's localhost. For a deployed endpoint, a compatible configuration is:

```json
{"mcpServers":{"talksprout":{"url":"https://talksprout-mcp.octopusgarage.workers.dev/mcp"}}}
```

The configuration above uses the verified public service; replace it with your own host for self-hosting. Client schemas vary; use Streamable HTTP and no authentication in the host's supported connector flow. The server is remote HTTP, not a stdio command.

## Deploy and verify

The configured target is the dedicated OctopusGarage account, explicitly selected by the user to match Panfolio. Supply an account-scoped deployment token through the operator credential store or GitHub Actions secret; do not change the personal account or unrelated services. Run `pnpm mcp:build`, then `pnpm --dir mcp run deploy` using authorized credentials. The worker name is `talksprout-mcp`. Query `/health` and compare every identity field to `distribution/identity.json`, then perform initialize, tools/list and tools/call against `/mcp`. Only after successful remote verification set `distribution/config.json`'s `mcpEndpoint`, regenerate, and publish the corresponding app and packages. A successful local build is not a deployment claim.

POST bodies are bounded to 16 KiB even without Content-Length. Document access uses an exact bundled key, never filesystem reads or outbound fetches. Search returns at most 20 paths. No personal state, AI API keys, model execution or request-body logs are added. Configure operational rate limits at the hosting boundary if needed. Host origin validation is provided by the SDK handler.

Run `pnpm exec tsx scripts/verify-mcp.ts https://talksprout-mcp.octopusgarage.workers.dev/mcp` to verify deployed identity and real wire calls after deployment. This requires an actual reachable endpoint and fails on stale content identity.
