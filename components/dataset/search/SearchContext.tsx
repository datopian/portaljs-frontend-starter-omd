import { PackageSearchOptions } from "@/schemas/dataset.interface";
import { useRouter } from "next/router";
import { createContext, useContext } from "react";
import useSWR from "swr";
import { useRef, useEffect, useCallback } from "react";
import { searchDatasets } from "@/lib/queries/dataset";

type setQueryParamFn<T> = (value: T) => void;

interface SearchStateContext {
  packageSearchFacets: any;
  options: PackageSearchOptions;
  setOptions: setQueryParamFn<Partial<PackageSearchOptions>>;
  packageSearchResults: any;
  isLoadingPackageSearchResults: boolean;
  searchResults: any;
  searchFacets: any;
  isLoading: boolean;
}

export const SearchStateContext = createContext<SearchStateContext | null>(
  null
);

export const useSearchState = () => useContext(SearchStateContext);

export const SearchStateProvider = ({
  children,
  facets,
}: {
  children: React.ReactNode;
  facets: any;
}) => {
  const router = useRouter();
  const { query } = router;

  const setQueryParam = (
    partial:
      | {
          [k: string]: string | Array<string>;
        }
      | Partial<PackageSearchOptions>
  ) => {
    router.push({ query: { ...query, ...partial } }, undefined, {
      shallow: true,
    });
  };

  const options: PackageSearchOptions = {
    offset: query?.offset ? parseInt(query?.offset as string) : 0,
    limit: 10,
    tags: parseArQueryParam(query?.tags),
    groups: parseArQueryParam(query?.groups),
    orgs: parseArQueryParam(query?.orgs),
    resFormat: parseArQueryParam(query?.resFormat),
    query: (query?.query as string) ?? "",
    sort: (query?.sort as string) ?? "score desc",
    type: (query?.type as string) ?? "dataset",
  };

  const {
    data: packageSearchResults,
    isValidating: isLoadingPackageSearchResults,
  } = useSWR(
    ["/api/datasets/search", options],
    async (api, options) => {
      const searchParams = new URLSearchParams();
      searchParams.set("limit", String(options.limit));
      searchParams.set("offset", String(options.offset));
      for (let org of options.orgs) {
        searchParams.append("orgs", org);
      }
      for (let tag of options.tags) {
        searchParams.append("tags", tag);
      }
      for (let format of options.resFormat) {
        searchParams.append("resFormat", format);
      }
      searchParams.set("query", options.query);
      searchParams.set("sort", options.sort);
      const res = await fetch(`${api}?${searchParams.toString()}`);
      const data = await res.json();
      return data;
      // return searchDatasets(options)
    },
    { use: [laggy] }
  );

  const searchResults = packageSearchResults;
  const isLoading = isLoadingPackageSearchResults;

  const packageSearchFacets = packageSearchResults?.search_facets ?? {};
  const searchFacets = packageSearchFacets;

  const value: SearchStateContext = {
    options,
    setOptions: (options) => setQueryParam(options),
    packageSearchFacets: packageSearchFacets,
    packageSearchResults,
    isLoadingPackageSearchResults,
    searchResults,
    searchFacets,
    isLoading,
  };

  return (
    <SearchStateContext.Provider value={value}>
      {children}
    </SearchStateContext.Provider>
  );
};

const parseArQueryParam = (queryParam: any) => {
  if (Array.isArray(queryParam)) {
    return queryParam;
  }

  if (!!queryParam) {
    return [queryParam];
  }

  return [];
};

// This is a SWR middleware for keeping the data even if key changes.
function laggy(useSWRNext) {
  return (key, fetcher, config) => {
    // Use a ref to store previous returned data.
    const laggyDataRef = useRef();

    // Actual SWR hook.
    const swr = useSWRNext(key, fetcher, config);

    useEffect(() => {
      // Update ref if data is not undefined.
      if (swr.data !== undefined) {
        laggyDataRef.current = swr.data;
      }
    }, [swr.data]);

    // Expose a method to clear the laggy data, if any.
    const resetLaggy = useCallback(() => {
      laggyDataRef.current = undefined;
    }, []);

    // Fallback to previous data if the current data is undefined.
    const dataOrLaggyData =
      swr.data === undefined ? laggyDataRef.current : swr.data;

    // Is it showing previous data?
    const isLagging =
      swr.data === undefined && laggyDataRef.current !== undefined;

    // Also add a `isLagging` field to SWR.
    return Object.assign({}, swr, {
      data: dataOrLaggyData,
      isLagging,
      resetLaggy,
    });
  };
}
