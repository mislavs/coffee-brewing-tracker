import type { Guid } from '@/lib/api-types'
import {
  getCreateAccessoryUrl,
  getGetAccessoriesUrl,
  getGetAccessoryByIdUrl,
  getUpdateAccessoryUrl,
} from '@/lib/api/generated/accessories/accessories'
import {
  getCreateBeanUrl,
  getGetBeanByIdUrl,
  getGetBeansUrl,
  getUpdateBeanUrl,
} from '@/lib/api/generated/beans/beans'
import {
  getCreateBrewLogUrl,
  getDeleteBrewLogUrl,
  getGetBrewLogByIdUrl,
  getGetBrewLogsUrl,
  getUpdateBrewLogUrl,
} from '@/lib/api/generated/brew-logs/brew-logs'
import {
  getCreateBrewerUrl,
  getGetBrewerByIdUrl,
  getGetBrewersUrl,
  getUpdateBrewerUrl,
} from '@/lib/api/generated/brewers/brewers'
import { getGetCountriesUrl } from '@/lib/api/generated/countries/countries'
import { getGetFlavorNotesUrl } from '@/lib/api/generated/flavor-notes/flavor-notes'
import {
  getCreateGrinderUrl,
  getGetGrinderByIdUrl,
  getGetGrindersUrl,
  getUpdateGrinderUrl,
} from '@/lib/api/generated/grinders/grinders'
import {
  getCreateRecipeUrl,
  getDeleteRecipeUrl,
  getGetRecipeByIdUrl,
  getGetRecipesUrl,
  getUpdateRecipeUrl,
} from '@/lib/api/generated/recipes/recipes'
import {
  getCreateRoasterUrl,
  getDeleteRoasterLogoUrl,
  getGetRoasterByIdUrl,
  getGetRoastersUrl,
  getUpdateRoasterUrl,
  getUploadRoasterLogoUrl,
} from '@/lib/api/generated/roasters/roasters'
import { getGetDashboardStatsUrl } from '@/lib/api/generated/stats/stats'
import { requestJson, requestVoid } from '@/lib/api/request'
import type {
  AccessoryDto,
  BeanDto,
  BeanSummaryDto,
  BrewLogDto,
  BrewLogSummaryDto,
  BrewerDto,
  BrewerSummaryDto,
  CountryDto,
  CreateAccessoryRequest,
  CreateAccessoryResponse,
  CreateBeanRequest,
  CreateBeanResponse,
  CreateBrewLogRequest,
  CreateBrewLogResponse,
  CreateBrewerRequest,
  CreateBrewerResponse,
  CreateGrinderRequest,
  CreateGrinderResponse,
  CreateRecipeRequest,
  CreateRecipeResponse,
  CreateRoasterRequest,
  CreateRoasterResponse,
  DashboardStatsDto,
  FlavorNoteDto,
  GetBeansParams,
  GetBrewLogsParams,
  GetRecipesParams,
  GrinderDto,
  GrinderSummaryDto,
  RecipeDto,
  RecipeSummaryDto,
  RoasterDto,
  RoasterSummaryDto,
  UpdateAccessoryRequest,
  UpdateBeanRequest,
  UpdateBrewLogRequest,
  UpdateBrewerRequest,
  UpdateGrinderRequest,
  UpdateRecipeRequest,
  UpdateRoasterRequest,
} from '@/lib/api/schemas'

type QueryRequest<TQueryParameters> = {
  queryParameters?: TQueryParameters
}

type BrewLogsQueryParameters = Omit<GetBrewLogsParams, 'dateFrom' | 'dateTo'> & {
  dateFrom?: string | Date
  dateTo?: string | Date
}

const jsonRequestHeaders = {
  'Content-Type': 'application/json',
}

function serializeJsonBody(value: unknown) {
  return JSON.stringify(value)
}

function toIsoDateQueryValue(value: string | Date | undefined) {
  if (!value) {
    return undefined
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString()
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

export const apiClient = {
  api: {
    accessories: {
      get: () =>
        requestJson<AccessoryDto[]>(getGetAccessoriesUrl(), {
          method: 'GET',
        }),
      post: (request: CreateAccessoryRequest) =>
        requestJson<CreateAccessoryResponse>(getCreateAccessoryUrl(), {
          method: 'POST',
          headers: jsonRequestHeaders,
          body: serializeJsonBody(request),
        }),
      byId: (id: Guid) => ({
        get: () =>
          requestJson<AccessoryDto>(getGetAccessoryByIdUrl(id), {
            method: 'GET',
          }),
        put: (request: UpdateAccessoryRequest) =>
          requestVoid(getUpdateAccessoryUrl(id), {
            method: 'PUT',
            headers: jsonRequestHeaders,
            body: serializeJsonBody(request),
          }),
      }),
    },
    beans: {
      get: (request?: QueryRequest<GetBeansParams>) =>
        requestJson<BeanSummaryDto[]>(
          getGetBeansUrl(request?.queryParameters),
          {
            method: 'GET',
          },
        ),
      post: (request: CreateBeanRequest) =>
        requestJson<CreateBeanResponse>(getCreateBeanUrl(), {
          method: 'POST',
          headers: jsonRequestHeaders,
          body: serializeJsonBody(request),
        }),
      byId: (id: Guid) => ({
        get: () =>
          requestJson<BeanDto>(getGetBeanByIdUrl(id), {
            method: 'GET',
          }),
        put: (request: UpdateBeanRequest) =>
          requestVoid(getUpdateBeanUrl(id), {
            method: 'PUT',
            headers: jsonRequestHeaders,
            body: serializeJsonBody(request),
          }),
      }),
    },
    brewLogs: {
      get: (request?: QueryRequest<BrewLogsQueryParameters>) => {
        const queryParameters = request?.queryParameters

        return requestJson<BrewLogSummaryDto[]>(
          getGetBrewLogsUrl(
            queryParameters
              ? {
                  search: queryParameters.search,
                  dateFrom: toIsoDateQueryValue(queryParameters.dateFrom),
                  dateTo: toIsoDateQueryValue(queryParameters.dateTo),
                }
              : undefined,
          ),
          {
            method: 'GET',
          },
        )
      },
      post: (request: CreateBrewLogRequest) =>
        requestJson<CreateBrewLogResponse>(getCreateBrewLogUrl(), {
          method: 'POST',
          headers: jsonRequestHeaders,
          body: serializeJsonBody(request),
        }),
      byId: (id: Guid) => ({
        get: () =>
          requestJson<BrewLogDto>(getGetBrewLogByIdUrl(id), {
            method: 'GET',
          }),
        put: (request: UpdateBrewLogRequest) =>
          requestVoid(getUpdateBrewLogUrl(id), {
            method: 'PUT',
            headers: jsonRequestHeaders,
            body: serializeJsonBody(request),
          }),
        delete: () =>
          requestVoid(getDeleteBrewLogUrl(id), {
            method: 'DELETE',
          }),
      }),
    },
    brewers: {
      get: () =>
        requestJson<BrewerSummaryDto[]>(getGetBrewersUrl(), {
          method: 'GET',
        }),
      post: (request: CreateBrewerRequest) =>
        requestJson<CreateBrewerResponse>(getCreateBrewerUrl(), {
          method: 'POST',
          headers: jsonRequestHeaders,
          body: serializeJsonBody(request),
        }),
      byId: (id: Guid) => ({
        get: () =>
          requestJson<BrewerDto>(getGetBrewerByIdUrl(id), {
            method: 'GET',
          }),
        put: (request: UpdateBrewerRequest) =>
          requestVoid(getUpdateBrewerUrl(id), {
            method: 'PUT',
            headers: jsonRequestHeaders,
            body: serializeJsonBody(request),
          }),
      }),
    },
    countries: {
      get: () =>
        requestJson<CountryDto[]>(getGetCountriesUrl(), {
          method: 'GET',
        }),
    },
    flavorNotes: {
      get: () =>
        requestJson<FlavorNoteDto[]>(getGetFlavorNotesUrl(), {
          method: 'GET',
        }),
    },
    grinders: {
      get: () =>
        requestJson<GrinderSummaryDto[]>(getGetGrindersUrl(), {
          method: 'GET',
        }),
      post: (request: CreateGrinderRequest) =>
        requestJson<CreateGrinderResponse>(getCreateGrinderUrl(), {
          method: 'POST',
          headers: jsonRequestHeaders,
          body: serializeJsonBody(request),
        }),
      byId: (id: Guid) => ({
        get: () =>
          requestJson<GrinderDto>(getGetGrinderByIdUrl(id), {
            method: 'GET',
          }),
        put: (request: UpdateGrinderRequest) =>
          requestVoid(getUpdateGrinderUrl(id), {
            method: 'PUT',
            headers: jsonRequestHeaders,
            body: serializeJsonBody(request),
          }),
      }),
    },
    recipes: {
      get: (request?: QueryRequest<GetRecipesParams>) =>
        requestJson<RecipeSummaryDto[]>(getGetRecipesUrl(request?.queryParameters), {
          method: 'GET',
        }),
      post: (request: CreateRecipeRequest) =>
        requestJson<CreateRecipeResponse>(getCreateRecipeUrl(), {
          method: 'POST',
          headers: jsonRequestHeaders,
          body: serializeJsonBody(request),
        }),
      byId: (id: Guid) => ({
        get: () =>
          requestJson<RecipeDto>(getGetRecipeByIdUrl(id), {
            method: 'GET',
          }),
        put: (request: UpdateRecipeRequest) =>
          requestVoid(getUpdateRecipeUrl(id), {
            method: 'PUT',
            headers: jsonRequestHeaders,
            body: serializeJsonBody(request),
          }),
        delete: () =>
          requestVoid(getDeleteRecipeUrl(id), {
            method: 'DELETE',
          }),
      }),
    },
    roasters: {
      get: () =>
        requestJson<RoasterSummaryDto[]>(getGetRoastersUrl(), {
          method: 'GET',
        }),
      post: (request: CreateRoasterRequest) =>
        requestJson<CreateRoasterResponse>(getCreateRoasterUrl(), {
          method: 'POST',
          headers: jsonRequestHeaders,
          body: serializeJsonBody(request),
        }),
      byId: (id: Guid) => ({
        get: () =>
          requestJson<RoasterDto>(getGetRoasterByIdUrl(id), {
            method: 'GET',
          }),
        put: (request: UpdateRoasterRequest) =>
          requestVoid(getUpdateRoasterUrl(id), {
            method: 'PUT',
            headers: jsonRequestHeaders,
            body: serializeJsonBody(request),
          }),
        logo: {
          put: async (file: File) => {
            const formData = new FormData()
            formData.append('file', file)

            await requestVoid(getUploadRoasterLogoUrl(id), {
              method: 'PUT',
              body: formData,
            })
          },
          delete: () =>
            requestVoid(getDeleteRoasterLogoUrl(id), {
              method: 'DELETE',
            }),
        },
      }),
    },
    stats: {
      dashboard: {
        get: () =>
          requestJson<DashboardStatsDto>(getGetDashboardStatsUrl(), {
            method: 'GET',
          }),
      },
    },
  },
}
