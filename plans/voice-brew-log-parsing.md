# Voice Brew Log Parsing

## Assumptions

- **Provider abstraction:** Use `Microsoft.Extensions.AI` for provider-agnostic AI interfaces (`ISpeechToTextClient`, `IChatClient`). The Application layer depends on `Microsoft.Extensions.AI.Abstractions`; the Infrastructure layer depends on provider packages. Install latest versions of all NuGet packages (no pinned versions).
- **Initial transcription provider:** whisper.cpp via `Whisper.net` -- runs locally, no API key needed. The code is structured so this can be swapped for an OpenAI Whisper API implementation (or any other `ISpeechToTextClient`) via config alone.
- **Initial extraction provider:** OpenRouter via `Microsoft.Extensions.AI.OpenAI` (OpenRouter exposes an OpenAI-compatible API). The `OpenAIClient` is pointed at `https://openrouter.ai/api/v1` with an OpenRouter API key.
- **Future provider flexibility:** Both transcription and extraction providers are independently configurable via `appsettings.json`. Adding OpenAI Whisper API, Azure Speech, Ollama, or any OpenAI-compatible endpoint is an Infrastructure-only change.
- Audio is recorded via `MediaRecorder` API in the browser (cross-browser, works in Firefox) and sent as a file upload (`multipart/form-data`) to the backend.
- The parse-voice endpoint is a **suggestion tool**, not a submission path. It returns parsed field values that the user reviews in the form before submitting.
- When no AI provider is configured, the app runs normally (null object pattern); the mic button is hidden via a feature availability endpoint.
- **Entity catalog filtering:** Only beans with `IsAvailable = true` are included in the entity catalog sent to the LLM. All brewers, grinders, recipes, and accessories are included regardless.

---

## Step 1: Backend -- AI Abstractions, Null Implementations, Parse Voice Endpoint, and Feature Availability

**Goal:** The parse-voice infrastructure exists end-to-end on the backend. The endpoint accepts audio, calls the (null) services, and returns an empty result. Feature availability endpoint correctly reports the feature as disabled.

**Scope:**

**Application layer -- Package reference and abstractions:**

- Add `Microsoft.Extensions.AI.Abstractions` package to [CoffeeTracker.Application.csproj](backend/src/CoffeeTracker.Application/CoffeeTracker.Application.csproj)
- The handler injects `ISpeechToTextClient` (from `Microsoft.Extensions.AI`) directly for transcription -- no custom wrapper needed since the interface is already provider-agnostic and can be backed by whisper.cpp, OpenAI Whisper API, or any other provider
- New `Application/Abstractions/AI/IBrewLogExtractionService.cs` -- custom interface for extraction because the prompt construction and JSON parsing logic is application-specific:
  - `Task<BrewLogExtractionResult> ExtractAsync(string transcript, EntityCatalog catalog, CancellationToken ct)`
- New `Application/Abstractions/AI/IAiFeatureAvailability.cs` -- `bool IsVoiceBrewLogParsingAvailable { get; }` (read by the features query handler)

- New folder `Application/Features/BrewLog/Commands/ParseVoiceBrewLog/`:
  - `ParseVoiceBrewLogCommand.cs` -- MediatR command record (`Stream AudioStream, string ContentType`) + handler
    - Handler injects `ISpeechToTextClient` and `IBrewLogExtractionService`
    - Calls `ISpeechToTextClient.GetTextAsync()` with the audio stream
    - Queries DB for entity catalogs: **beans filtered to `IsAvailable == true`** (with `Id`+`Name`), plus all brewers, grinders, recipes, accessories
    - Calls `IBrewLogExtractionService.ExtractAsync(transcript, catalog)`
    - Returns `ParseVoiceBrewLogResult`
  - `ParseVoiceBrewLogValidator.cs` -- validates `AudioStream` is not null and `ContentType` is a supported audio MIME type

- New DTOs in `Application/Features/BrewLog/Dtos/`:
  - `ParseVoiceBrewLogResult.cs` -- `string Transcript` + all nullable brew log fields (with matched entity names alongside IDs) + `List<string> UnmatchedReferences` + static `Empty` factory
  - `EntityCatalog.cs` -- record holding `List<EntityRef> Beans`, `Brewers`, `Grinders`, `Recipes`, `Accessories` (where `EntityRef` is `record EntityRef(Guid Id, string Name)`)
  - `BrewLogExtractionResult.cs` -- extracted fields record with static `Empty` property

- New folder `Application/Features/Features/Queries/`:
  - `GetFeaturesQuery.cs` -- MediatR query + handler returning `FeaturesDto`
  - `FeaturesDto.cs` -- `bool VoiceBrewLogParsing`
  - Handler injects `IAiFeatureAvailability` and reads `IsVoiceBrewLogParsingAvailable`

**Infrastructure layer -- Null implementations:**

- New folder `Infrastructure/AI/`:
  - `NullSpeechToTextClient.cs` -- implements `ISpeechToTextClient`, returns empty `SpeechToTextResponse` (null object)
  - `NullBrewLogExtractionService.cs` -- implements `IBrewLogExtractionService`, returns `BrewLogExtractionResult.Empty` (null object)
  - `AiFeatureAvailability.cs` -- implements `IAiFeatureAvailability`, takes a `bool` in constructor set during DI registration based on whether real or null providers are wired

**Infrastructure layer -- DI:**

- Add an `AddAiServices(IConfiguration)` method in [IServiceCollectionExtensions.cs](backend/src/CoffeeTracker.Infrastructure/IServiceCollectionExtensions.cs):
  - Reads `AI:Transcription:Provider` and `AI:Extraction:Provider` from config
  - When null/empty/missing: registers `NullSpeechToTextClient` as `ISpeechToTextClient` and `NullBrewLogExtractionService` as `IBrewLogExtractionService`
  - When a provider name is set: placeholder `throw new NotImplementedException()` (Step 2 implements the real providers)
  - Registers `IAiFeatureAvailability` with `IsVoiceBrewLogParsingAvailable` set based on whether both providers resolved to real implementations
- Call `AddAiServices(builder.Configuration)` from the existing `AddInfrastructure` method

**API layer:**

- New contract `Contracts/ParseVoiceBrewLogResponse.cs` mapping from `ParseVoiceBrewLogResult`
- Add `POST /api/brew-logs/parse-voice` to [BrewLogEndpoints.cs](backend/src/CoffeeTracker.Api/Endpoints/BrewLogEndpoints.cs):
  - Accepts `IFormFile audioFile`
  - Maps to `ParseVoiceBrewLogCommand`
  - Returns `Ok<ParseVoiceBrewLogResponse>`
  - Annotate with `.DisableAntiforgery()` and `.Accepts<IFormFile>("multipart/form-data")`
- New `Endpoints/FeatureEndpoints.cs`:
  - `GET /api/features` returning `FeaturesDto`
  - Register in [Program.cs](backend/src/CoffeeTracker.Api/Program.cs) with `app.MapFeatureEndpoints()`

**Tests:**

- Unit tests: `ParseVoiceBrewLogValidator` -- valid audio content type passes, invalid fails, null stream fails
- Integration tests: `ParseVoiceBrewLogHandler` -- with null services injected, returns empty transcript and empty extraction result; verify bean query filters to `IsAvailable == true`
- Integration tests: `GetFeaturesHandler` -- returns `VoiceBrewLogParsing: false` when null services are registered

**Verification:** `dotnet build` and `dotnet test` from solution root

**Exit criteria:** `POST /api/brew-logs/parse-voice` returns 200 with empty result. `GET /api/features` returns `{ voiceBrewLogParsing: false }`. All existing tests still pass.

---

## Step 2: Backend -- whisper.cpp Transcription + OpenRouter Extraction

**Goal:** When providers are configured, the parse-voice endpoint transcribes audio locally via whisper.cpp and extracts structured brew log data via OpenRouter -- all through the `Microsoft.Extensions.AI` abstraction layer.

**Scope:**

**Infrastructure layer -- Packages:**

- Add `Whisper.net` and `Whisper.net.Runtime.Cpu` to [CoffeeTracker.Infrastructure.csproj](backend/src/CoffeeTracker.Infrastructure/CoffeeTracker.Infrastructure.csproj) (for whisper.cpp transcription)
- Add `Microsoft.Extensions.AI.OpenAI` to [CoffeeTracker.Infrastructure.csproj](backend/src/CoffeeTracker.Infrastructure/CoffeeTracker.Infrastructure.csproj) (for OpenRouter extraction via OpenAI-compatible API; brings in `OpenAI` SDK transitively)

**Infrastructure layer -- Configuration:**

- New `Infrastructure/AI/AiSettings.cs` -- options classes bound from `AI` config section:

```csharp
public sealed class AiSettings
{
    public TranscriptionSettings Transcription { get; init; } = new();
    public ExtractionSettings Extraction { get; init; } = new();
}

public sealed class TranscriptionSettings
{
    public string? Provider { get; init; }
    public string? ModelPath { get; init; }
}

public sealed class ExtractionSettings
{
    public string? Provider { get; init; }
    public string? ApiKey { get; init; }
    public string? Endpoint { get; init; }
    public string? Model { get; init; }
}
```

- Each concern (transcription/extraction) carries its own configuration -- no shared block
- `TranscriptionSettings.ModelPath` points to the whisper.cpp GGML model file
- `ExtractionSettings.Endpoint` defaults to `https://openrouter.ai/api/v1` when `Provider` is `"OpenRouter"`

**Infrastructure layer -- whisper.cpp transcription:**

- New `Infrastructure/AI/WhisperCpp/WhisperCppSpeechToTextClient.cs`:
  - Implements `ISpeechToTextClient` from `Microsoft.Extensions.AI`
  - Loads `WhisperProcessor` from the configured `ModelPath` (singleton, initialized once)
  - Converts incoming audio stream (webm from browser) to PCM 16kHz mono float32 via FFmpeg subprocess (`ffmpeg -i pipe:0 -ar 16000 -ac 1 -f f32le pipe:1`)
  - Feeds PCM samples to `WhisperProcessor.ProcessAsync()`
  - Returns transcript as `SpeechToTextResponse`
  - **Note:** Structured so this entire class can be replaced by an OpenAI Whisper implementation in the future -- the handler only sees `ISpeechToTextClient`

**Infrastructure layer -- OpenRouter extraction:**

- New `Infrastructure/AI/BrewLogExtractionService.cs`:
  - Injects `IChatClient` (from `Microsoft.Extensions.AI`)
  - Builds a system prompt with the entity catalog (available bean names+IDs, brewer names+IDs, etc.)
  - Calls `IChatClient.GetResponseAsync()` with structured output (JSON response format) instructing the model to return a JSON object matching the `BrewLogExtractionResult` schema
  - Parses the JSON response into `BrewLogExtractionResult`
  - Populates `UnmatchedReferences` for entities mentioned but not matched

**Infrastructure layer -- DI registration:**

- Update `AddAiServices` in [IServiceCollectionExtensions.cs](backend/src/CoffeeTracker.Infrastructure/IServiceCollectionExtensions.cs):
  - Bind `AiSettings` from `AI` config section
  - Transcription provider switch:
    - `"WhisperCpp"`: register `WhisperCppSpeechToTextClient` as `ISpeechToTextClient` (singleton, loads model once)
    - `"OpenAI"`: *(future)* register via `openAiClient.AsSpeechToTextClient(model)` -- leave as `throw new NotImplementedException("OpenAI transcription not yet implemented")`
    - null/empty: register `NullSpeechToTextClient`
  - Extraction provider switch:
    - `"OpenRouter"`: register `IChatClient` via `new OpenAIClient(new ApiKeyCredential(apiKey), new() { Endpoint = new Uri("https://openrouter.ai/api/v1") }).AsChatClient(model)`, register `BrewLogExtractionService` as `IBrewLogExtractionService`
    - `"OpenAI"`: *(future)* same as OpenRouter but without custom endpoint -- leave as `throw new NotImplementedException("Direct OpenAI extraction not yet implemented")`
    - null/empty: register `NullBrewLogExtractionService`
  - `IAiFeatureAvailability` resolves to `true` when both are non-null implementations

**Configuration (`appsettings.json` / user secrets):**

```json
{
  "AI": {
    "Transcription": {
      "Provider": "WhisperCpp",
      "ModelPath": "models/ggml-base-q5_1.bin"
    },
    "Extraction": {
      "Provider": "OpenRouter",
      "ApiKey": "sk-or-...",
      "Model": "openai/gpt-4o"
    }
  }
}
```

**Model file:** Download `ggml-base-q5_1.bin` (~57 MB) from Hugging Face (`ggerganov/whisper.cpp`). Document the download step. The model path is relative to the API project's working directory.

**Tests:**

- Unit tests for `BrewLogExtractionService`: substitute `IChatClient`, verify prompt includes entity catalog with only available beans, verify JSON response is parsed into `BrewLogExtractionResult` correctly
- Unit tests for `WhisperCppSpeechToTextClient`: verify audio conversion pipeline setup (mock FFmpeg process), verify `WhisperProcessor` invocation
- Unit test: `GetFeaturesHandler` returns `VoiceBrewLogParsing: true` when real services are registered

**Verification:** `dotnet build` and `dotnet test`

**Exit criteria:** With providers configured and model file present, `POST /api/brew-logs/parse-voice` transcribes audio locally and returns structured extraction results. `GET /api/features` returns `{ voiceBrewLogParsing: true }`. Without config, behavior from Step 1 is unchanged (null objects, feature reports false). FFmpeg must be on PATH for transcription to work.

---

## Step 3: Frontend -- Audio Recording, Voice Input Dialog, and Form Auto-Fill

**Goal:** A microphone button appears on the brew log creation form (when the feature is available). Clicking it opens a dialog that records audio, sends it to the backend, shows the transcript and matched fields, and fills the form on confirmation.

**Scope:**

**API client:**

- Add manual (non-Orval) API functions in `lib/api-client.ts`:
  - `apiClient.api.features.get()` -- `GET /api/features`
  - `apiClient.api.brewLogs.parseVoice(audioBlob: Blob)` -- `POST /api/brew-logs/parse-voice` with `multipart/form-data` body (uses `FormData`, no JSON serialization, no `Content-Type` header so the browser sets the boundary automatically)
- Add TypeScript types for `FeaturesDto` and `ParseVoiceBrewLogResponse` in `lib/api/schemas.ts` (or a dedicated `lib/api/voice-types.ts`)
- Regenerate Orval types to pick up the new `GET /api/features` endpoint (or add types manually since parse-voice is multipart and won't auto-generate cleanly)

**Hooks (`features/brew-log/hooks/`):**

- `useFeatures.ts` -- TanStack Query hook calling `apiClient.api.features.get()`, with long `staleTime` (features rarely change within a session)
- `useParseVoiceBrewLog.ts` -- TanStack Query `useMutation` wrapping `apiClient.api.brewLogs.parseVoice(blob)`
- `useAudioRecorder.ts` -- custom hook wrapping `MediaRecorder` API:
  - Returns `{ isRecording, startRecording, stopRecording, audioBlob, isSupported, error }`
  - Uses `navigator.mediaDevices.getUserMedia({ audio: true })`
  - Records to `audio/webm` (Firefox/Chrome both support this)
  - Cleans up media stream on unmount

**Components (`features/brew-log/components/`):**

- `VoiceInputButton.tsx`:
  - Microphone icon button (Lucide `Mic` icon)
  - Opens the voice input dialog
  - Only rendered when `useFeatures().data?.voiceBrewLogParsing` is true

- `VoiceInputDialog.tsx` -- Radix Dialog with multi-state UI:
  - **Idle:** "Tap to start recording" prompt
  - **Recording:** pulsing mic icon, "Listening..." text, Stop button
  - **Processing:** spinner, "Processing your brew description..."
  - **Result:** displays transcript in a blockquote, lists matched fields (bean name, brewer name, dose, etc.), shows warnings for unmatched references, "Fill form" and "Cancel" buttons
  - **Error:** error message with retry button

**Form integration ([BrewLogFormCardContainer.tsx](frontend/src/features/brew-log/components/BrewLogFormCardContainer.tsx)):**

- Import `VoiceInputButton` and `VoiceInputDialog`
- Add mic button next to the form title or in the `CardHeader`
- On "Fill form" click in the dialog, call `form.setValue()` for each non-null field from the response:
  - Entity IDs (`beanId`, `brewerId`, `grinderId`, `recipeId`, `accessoryIds`) set directly
  - Numeric values (`dose`, `waterAmount`, `waterTemperature`, `rating`) set directly
  - `brewTimeSeconds` decomposed into `brewTimeMinutes` and `brewTimeSeconds` form fields
  - String values (`grindSize`, `tastingNotes`/`notes`, `adjustmentIdeas`) set directly
  - `brewedAt` left as-is (defaults to "now" already)
- Use `{ shouldValidate: true }` option in `setValue` to trigger validation on filled fields

**Tests:** N/A (UI component -- verified by build + manual testing)

**Verification:** `npm run build`

**Exit criteria:** Mic button visible on brew log form when providers are configured. Recording works, audio is sent to backend, transcript and matched fields displayed, "Fill form" populates the form correctly. Mic button hidden when AI is not configured. Form submission still works as before.

---

## Cross-Step Risks and Mitigations

- **Audio format conversion:** whisper.cpp expects PCM audio but browsers produce webm. The `WhisperCppSpeechToTextClient` converts via FFmpeg subprocess. FFmpeg must be on PATH -- document this as a prerequisite. If FFmpeg is missing, the transcription service should return a clear error.
- **whisper.cpp model file:** The ~57 MB model file must be downloaded separately. Add a script or document the download step. Fail with a clear error at startup if the configured `ModelPath` doesn't exist.
- **OpenRouter API latency:** Extraction via OpenRouter may take 2-4 seconds. The dialog shows a processing state. whisper.cpp transcription is local and fast for short clips.
- **Entity catalog size:** If the user has many available beans/brewers, the LLM prompt could get large. GPT-4o handles 128K tokens, so this is unlikely to be an issue. Monitor token usage in logs.
- **LLM hallucination:** The extraction service should only match entities that exist in the catalog. The structured output schema constrains the response. Unmatched references are surfaced to the user.
- **Microsoft.Extensions.AI maturity:** `ISpeechToTextClient` is marked experimental (MEAI001). If the API changes, only the Infrastructure adapters need updating -- the handler uses the stable interface.
- **Microphone permissions:** The browser will prompt for mic access. If denied, `useAudioRecorder` reports `isSupported: false` or an error. The dialog shows a helpful message.

## Future Provider Expansion

Adding a new provider requires only Infrastructure-layer changes. The handler and Application layer are untouched:

- **OpenAI Whisper API (transcription):** Add a new `ISpeechToTextClient` implementation using `openAiClient.AsSpeechToTextClient(model)` from `Microsoft.Extensions.AI.OpenAI`. Register when `Provider` is `"OpenAI"`. No FFmpeg or model file needed -- audio is sent directly to the API.
- **Direct OpenAI (extraction):** Same `Microsoft.Extensions.AI.OpenAI` package, same `BrewLogExtractionService`, but `OpenAIClient` without a custom endpoint.
- **Ollama (local LLM):** Add `Microsoft.Extensions.AI.Ollama` package. Register `new OllamaApiClient(baseUrl, model)` as `IChatClient`. Same `BrewLogExtractionService`.
- **Azure OpenAI:** Same `Microsoft.Extensions.AI.OpenAI` package, `OpenAIClient` pointed at the Azure endpoint.
- **Any OpenAI-compatible API:** Set `Endpoint` in `ExtractionSettings` to the provider's URL.

## Final Validation Checklist

- [ ] `GET /api/features` returns `{ voiceBrewLogParsing: false }` when no AI config
- [ ] `GET /api/features` returns `{ voiceBrewLogParsing: true }` when providers are configured
- [ ] `POST /api/brew-logs/parse-voice` returns empty result with null implementations
- [ ] `POST /api/brew-logs/parse-voice` transcribes and extracts with providers configured
- [ ] Entity catalog contains only available beans (`IsAvailable == true`)
- [ ] Entity names are resolved to GUIDs correctly (beans, brewers, grinders, recipes, accessories)
- [ ] Unmatched entity references are reported in the response
- [ ] Mic button hidden when feature is unavailable
- [ ] Mic button visible on brew log creation form when feature is available
- [ ] Audio recording works in Firefox
- [ ] Transcript displayed to user after processing
- [ ] Matched fields displayed before form fill
- [ ] "Fill form" correctly populates all form fields
- [ ] Form validation runs on filled fields
- [ ] Existing brew log create/edit flows unaffected
- [ ] `dotnet build` and `dotnet test` pass
- [ ] `npm run build` succeeds
