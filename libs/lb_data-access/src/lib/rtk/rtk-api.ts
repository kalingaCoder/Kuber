import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import {
  apiUrls,
  appConstants,
  envSpecificDomainNames,
} from "@me/utils-root-props";
import { getCookie } from "@me/util-helpers";
// const env = config?.env || "DEV";

/*
We need to have only one rtk-api slice for one base url.
Presently this works with only one base url, but if a different base url needs to used for a specific url, then we need to extend this 
functionality to accept new base urls. 

For the new base url, we need to provide a different reducer path(reducerPath) & add it to the store wherever apiReducer(existing reducer path) is 
declard*/
const baseQuery = fetchBaseQuery({
  baseUrl: `${window["UPP_CONFIG"]?.["base_url"] || process.env["NX_REACT_API_BASE_URL"]
    }${window["UPP_CONFIG"]?.["apim_url"] || process.env["NX_REACT_APIM_URL"]}`,
  prepareHeaders: (headers) => {
    headers["Accept"] = `application/json`;
    headers["Content-Type"] = `application/json`;
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Ocp-Apim-Subscription-Key"] =
      window["UPP_CONFIG"]?.["apim_subscription_key"];
    headers["Ocp-Apim-Trace"] = true;
    headers["OAM_REMOTE_USER"] = window["OAM_REMOTE_USER"] || "TESTUSER";
    headers["USER_EMAIL"] = window["OAM_USER_EMAIL"] || "test@falcon.com";
    headers["AUTH_TOKEN"] = getCookie("ent-abs-auth");
    return headers;
  },
});
const custom: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  return await baseQuery(args, api, extraOptions);
};

export const makeApi: any = createApi({
  reducerPath: "apiReducer",
  baseQuery: custom,
  endpoints: () => ({}),
});

export const injectEndPointsWrapper = ({ endPointsData }) => {
  return makeApi.injectEndpoints({
    endpoints: (builder) => getEndpoints({ builder, endPointsData }),
  });
};

const getParamUrl = (ep_url, body, queryObj) => {
  const url = ep_url.replace("URL_PARAM", body.URL_PARAM);
  const { URL_PARAM, queryParams, ...restBody } = body;
  const createQueryParams =
    queryParams && Object.keys(queryParams).length > 0
      ? (queryObj["url"] = `${url}?${transformJsonToQueryStringParams(
        queryParams
      )}`)
      : (queryObj["url"] = `${url}`);
  return { createQueryParams, restBody };
};

function getEndpoints({ builder, endPointsData }) {
  const obj = {};
  const builderFnObj = {
    GET: "query",
  };

  endPointsData.forEach((e) => {
    const { ep_type, ep_name, ep_url } = e;
    let builderFn = builderFnObj[ep_type];
    if (!builderFn) {
      builderFn = "mutation";
    }

    obj[ep_name] = builder[builderFn](formQueryObj({ ep_url, ep_type }));
  });

  return obj;
}

function formQueryObj({ ep_url, ep_type }): any {
  return {
    query: (body) => {
      const queryObj = {
        method: ep_type,
        headers: {
          ...appConstants["HEADERS"],
          "Ocp-Apim-Subscription-Key":
            window["UPP_CONFIG"]?.["apim_subscription_key"] ||
            process.env["NX_REACT_APIM_SUBSCRIPTION_KEY"],
        },
      };
      let ep_url_copy = ep_url;
      if (ep_type === "GET") {
        if (body?.["URL_PARAMS"] && body["URL_PARAMS"][0]) {
          const params = body["URL_PARAMS"];
          params.forEach((v, i) => {
            ep_url_copy = ep_url_copy.replace(`URL_PARAM_${i}`, v);
          });
          queryObj["url"] = `${ep_url_copy}?${transformJsonToQueryStringParams(
            body.queryParams
          )}`;
          console.info(queryObj);
        } else if (ep_url_copy.includes("URL_PARAM")) {
          const url = ep_url_copy.replace("URL_PARAM", body.URL_PARAM);
          body && body.queryParams
            ? (queryObj["url"] = `${url}?${transformJsonToQueryStringParams(
              body.queryParams
            )}`)
            : (queryObj["url"] = `${url}`);
        } else {
          //Passes as  query params
          queryObj["url"] = ep_url_copy.includes("event")
            ? `${ep_url_copy}/${body}`
            : `${ep_url_copy}?${transformJsonToQueryStringParams(body)}`;
        }
      } else if (ep_type === "DELETE") {
        let getFinalParamVal = getParamUrl(ep_url_copy, body, queryObj);
        queryObj["url"] = getFinalParamVal?.createQueryParams;
        queryObj["body"] = getFinalParamVal?.restBody;
      } else if (ep_type === "PUT") {
        queryObj["body"] = body;
        queryObj["url"] = body
          ? `${ep_url_copy}/${body?.id}`
          : `${ep_url_copy}`;
      } else {
        queryObj["body"] = body;
        if (apiUrls?.["ALLOWANCE_ITEMS"]?.includes(ep_url_copy)) {
          queryObj["url"] = `${ep_url_copy}/${body.eventId}`;
        } else if (ep_url_copy.includes("URL_PARAM")) {
          let getFinalParamVal = getParamUrl(ep_url_copy, body, queryObj);
          queryObj["url"] = getFinalParamVal?.createQueryParams;
          queryObj["body"] = getFinalParamVal?.restBody;
        } else {
          //TODO: RAVI
          queryObj["url"] = ep_url_copy.includes("$eventId")
            ? ep_url_copy.replace("$eventId", body.eventId)
            : ep_url_copy;
        }
      }

      return queryObj;
    },
  };
}

const transformJsonToQueryStringParams = (obj) => {
  if (!obj) {
    return "";
  }
  const qParams = Object.keys(obj);
  return qParams.map((key) => key + "=" + obj[key]).join("&");
};
