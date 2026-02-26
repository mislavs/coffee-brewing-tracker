# AGENTS Runbook

## OpenAPI Refresh (Aspire)

1. Ensure Aspire is running.
   - If it is not running, start it with `aspire run`.
2. Use the Aspire MCP to get the API URL from resource metadata.
   - Select the active AppHost in MCP if needed.
   - Call `list_resources` and read the `api` resource `endpoint_urls` (`http` endpoint).
3. Use the URL from Aspire MCP directly.
   - If URL comes from Aspire MCP resource data, do not run manual URL verification.
4. Refresh OpenAPI spec in `frontend` using the MCP-derived URL:
   - `npm run update-api-spec -- --url=<API_SWAGGER_URL>`
   - Example: `npm run update-api-spec -- --url=http://localhost:5081/swagger/v1/swagger.json`
5. Regenerate API client in `frontend`:
   - `npm run generate-api`
6. Validate expected schema changes in:
   - `frontend/src/lib/api/generated/index.schemas.ts`
7. If sync fails (for example `fetch failed`) after following the steps above:
   - Stop immediately.
   - Do not continue with additional retries in this runbook.
   - Report the failure and captured error output.
