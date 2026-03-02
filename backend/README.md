# CoffeeTracker Backend

## Running

Start the full stack (API, database, migrations, frontend) via Aspire:

```powershell
cd backend/src/CoffeeTracker.AppHost
dotnet run
```

## Configuration

Non-sensitive settings live in `CoffeeTracker.Api/appsettings.Development.json`. Secrets must be stored using [.NET User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets).

## Voice Brew Log Parsing (optional)

Voice brew log parsing is disabled automatically when any of its dependencies are missing, so no setup is needed if you don't use it. To enable it:

1. Install **ffmpeg** and ensure it is on PATH.
2. Download a [Whisper.cpp](https://github.com/ggerganov/whisper.cpp) GGML model (e.g. `ggml-base.en-q5_1.bin`) and place it at the path configured in `AI:Transcription:ModelPath` (default: `../../models/ggml-base.en-q5_1.bin` relative to the API project).
3. Set your [OpenRouter](https://openrouter.ai/) API key via user secrets:

```powershell
dotnet user-secrets set "AI:Extraction:ApiKey" "<your-openrouter-api-key>" --project backend/src/CoffeeTracker.Api
```

The remaining settings can be configured via user secrets or in `appsettings.json`:

| Key | Value |
|---|---|
| `AI:Transcription:Provider` | `WhisperCpp` |
| `AI:Transcription:ModelPath` | `../../models/ggml-base.en-q5_1.bin` |
| `AI:Extraction:Provider` | `OpenRouter` |
| `AI:Extraction:Model` | `anthropic/claude-sonnet-4.6` |

## Tests

```powershell
dotnet test backend/tests
```
