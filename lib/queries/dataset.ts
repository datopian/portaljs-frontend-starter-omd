import { Activity, CKAN } from "@portaljs/ckan";
import {
  privateToPublicDatasetName,
  privateToPublicOrgName,
  publicToPrivateDatasetName,
} from "./utils";
import { Dataset, PackageSearchOptions } from "@/schemas/dataset.interface";
import CkanRequest, { CkanResponse } from "@portaljs/ckan-api-client-js";
import { Resource } from "@/schemas/resource.interface";
import { domainToOrg } from "./orgs";
import { omdFetch } from "../omd";

const DMS = process.env.NEXT_PUBLIC_DMS;
const mainOrg = process.env.NEXT_PUBLIC_ORG;

export async function searchDatasets(options: PackageSearchOptions) {
  const baseAction = `package_search`;
  const tagVocabName = mainOrg ? `vocab_portal-tags--${mainOrg}` : "tags";

  const facetFields = ["groups", "organization", "res_format", tagVocabName]
    .map((f) => `"${f}"`)
    .join(",");

  let queryParams: string[] = [];

  if (options?.query) {
    queryParams.push(`q=${options.query}`);
  }

  if (options?.offset) {
    queryParams.push(`start=${options.offset}`);
  }

  if (options?.limit || options?.limit == 0) {
    queryParams.push(`rows=${options.limit}`);
  }

  if (options?.sort) {
    queryParams.push(`sort=${options?.sort}`);
  }

  let fqList: string[] = [mainOrg ? `main_org:${mainOrg}` : ""];

  if (options?.fq) {
    fqList.push(options.fq);
  }

  let fqListGroups: string[] = [];
  if (options?.orgs?.length) {
    fqListGroups.push(`organization:(${joinTermsWithOr(options?.orgs)})`);
  }

  if (options?.groups?.length) {
    fqListGroups.push(`groups:(${joinTermsWithOr(options?.groups)})`);
  }

  if (options?.tags?.length) {
    fqListGroups.push(`${tagVocabName}:(${joinTermsWithOr(options?.tags)})`);
  }

  if (options?.resFormat?.length) {
    fqListGroups.push(`res_format:(${joinTermsWithOr(options.resFormat)})`);
  }

  if (options?.type) {
    fqListGroups.push(`dataset_type:${options.type}`);
  }

  if (fqListGroups?.length) {
    fqList.push(`+(${fqListGroups.join(" AND ")})`);
  }

  if (fqList?.length) {
    queryParams.push(`fq=${fqList.join(" ")}`);
  }

  const action = `${baseAction}?${queryParams.join(
    "&"
  )}&facet.field=[${facetFields}]&facet.limit=9999`;

  const res = await CkanRequest.get<
    CkanResponse<{
      results: Dataset[];
      count: number;
      search_facets: {
        [k: string]: {
          title: string;
          items: { name: string; display_name: string; count: number }[];
        };
      };
    }>
  >(action, { ckanUrl: DMS });

  const facets = res.result && res.result.search_facets;
  if (facets && tagVocabName in facets) {
    res.result.search_facets["tags"] = facets[tagVocabName];
  }

  return { ...res.result, datasets: res.result.results };
}

const joinTermsWithOr = (tems) => {
  return tems.map((t) => `"${t}"`).join(" OR ");
};

export const getDataset = async ({ name }: { name: string }) => {
  const DMS = process.env.NEXT_PUBLIC_DMS;
  const ckan = new CKAN(DMS);
  const privateName = publicToPrivateDatasetName(name);
  const dataset = await ckan.getDatasetDetails(privateName);
  dataset.name = privateToPublicDatasetName(dataset.name);

  return {
    ...dataset,
    _name: privateName,
    organization: {
      ...dataset.organization,
      name: privateToPublicOrgName(dataset.organization.name),
    },
  };
};

export async function getDataProduct(name: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("fields", "assets,domains,tags");
  const endpoint = `dataProducts/name/${name}?${searchParams.toString()}`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();
  const dataset = dataProductToDataset(data);
  const activityStream = await listDataProductVersions({ id: dataset.id });
  dataset.activity_stream = activityStream;
  return dataset;
}

export async function getTable(id: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("fields", "columns,tags,extension");
  const endpoint = `tables/${id}?${searchParams.toString()}`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();
  const resource = tableToResource(data);
  return resource;
}

export async function listTableVersions({ id }: { id: string }) {
  const endpoint = `tables/${id}/versions`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();
  const activityStream = data.versions.map((v) =>
    versionToActivity(JSON.parse(v), "resource")
  );
  return activityStream;
}

function tableToResource(table: any): Resource {
  return {
    id: table.id,
    name: table.displayName ?? table.name,
    format: "table",
    description: table.description ?? null,
    // url: `/api/resources/${table.fullyQualifiedName}/download`,
    metadata_modified: new Date(table.updatedAt).toISOString(),
    extras: {
      columns: table.columns,
      glossaryTerm: table.tags.find((t) => t.source === "Glossary") ?? null,
    },
  };
}

export async function searchDataProducts(options: PackageSearchOptions) {
  const queryParams: string[] = [];

  if (options?.offset) queryParams.push(`from=${options.offset}`);
  if (options?.limit !== undefined) queryParams.push(`size=${options.limit}`);

  if (options?.sort) {
    const sortMap = {
      "score desc": {
        sort_field: "_score",
        sort_order: "desc",
      },
      "title_string asc": {
        sort_field: "displayName.keyword",
        sort_order: "asc",
      },
      "title_string desc": {
        sort_field: "displayName.keyword",
        sort_order: "desc",
      },
      "metadata_modified desc": {
        sort_field: "updatedAt",
        sort_order: "desc",
      },
    };

    const sort = sortMap[options.sort];

    queryParams.push(`sort_field=${sort.sort_field}`);
    queryParams.push(`sort_order=${sort.sort_order}`);
  }

  // Build query filter if needed
  const filters: string[] = [];

  if (options?.tags?.length) {
    filters.push(`tags.name.keyword:(${options.tags.join(" OR ")})`);
  }

  if (options?.orgs?.length) {
    filters.push(`domains.displayName.keyword:(${options.orgs.join(" OR ")})`);
  }

  if (options?.resFormat?.length) {
    filters.push(`assets.type:(${options.resFormat.join(" OR ")})`);
  }

  filters.push(`entityType.keyword:dataproduct`);
  filters.push(`deleted:false`);

  if (options.query) {
    filters.push(`"${options.query.replace(/\//g, "")}"`);
  }

  const queryString = filters.join(" AND ");
  queryParams.push(`q=${queryString}`);
  queryParams.push("track_total_hits=true");

  const endpoint = `search/query?index=dataAsset&${queryParams.join("&")}`;

  const res = await omdFetch({ endpoint });
  const data = await res.json();

  const search_facets = {
    organization: await getFacets(
      queryString,
      "domains.displayName.keyword",
      "organization"
    ),
    tags: await getFacets(queryString, "tags.name.keyword", "tags"),
    res_format: await getFacets(queryString, "assets.type", "res_format"),
  };

  const searchResults = {
    count: data.hits.total.value,
    datasets: data.hits.hits.map((r) => dataProductToDataset(r._source)),
    search_facets: search_facets,
  };

  return searchResults;
}

export function dataProductToDataset(dataProduct: any): Dataset {
  return {
    id: dataProduct.id,
    name: dataProduct.fullyQualifiedName,
    title: dataProduct.displayName,
    notes: dataProduct.description,
    metadata_modified: new Date(dataProduct.updatedAt).toISOString(),
    version: dataProduct.version,
    resources: dataProduct.assets.map((a) => ({
      id: a.id,
      name: a.displayName,
      format: a.type,
      description: a.description ?? null,
    })),
    organization: {
      id: dataProduct.domains.at(0).id,
      name: dataProduct.domains.at(0).fullyQualifiedName,
      title: dataProduct.domains.at(0).displayName,
      display_name: dataProduct.domains.at(0).displayName,
      description: dataProduct.domains.at(0).description,
      is_organization: true,
      type: "organization",
      state: "active",
      package_count: 123, // TODO: can we implement this?
    },
    tags: dataProduct.tags.map((t) => ({ display_name: t.name })),
  };
}

async function listDataProductVersions({ id }: { id: string }) {
  const endpoint = `dataProducts/${id}/versions`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();
  const activityStream = data.versions.map((v) =>
    versionToActivity(JSON.parse(v), "package")
  );
  return activityStream;
}

export function versionToActivity(
  version: any,
  type: "package" | "organization" | "resource"
): Activity {
  let data;
  if (type === "package") {
    data = { package: dataProductToDataset(version) };
  } else if (type === "organization") {
    data = { package: domainToOrg(version) };
  } else if (type === "resource") {
    data = { package: tableToResource(version) };
  }

  return {
    id: version.id,
    timestamp: new Date(version.updatedAt).toISOString(),
    user_id: version.updatedBy,
    object_id: version.name,
    activity_type: !version.changeDescription ? "created" : "updated",
    data,
  };
}

async function getFacets(queryFilter: string, field: string, name: string) {
  const queryParams: string[] = [];
  queryParams.push(`q=${queryFilter}`);
  queryParams.push(`value=.*`);
  queryParams.push(`field=${field}`);
  const endpoint = `search/aggregate?index=dataAsset&${queryParams.join("&")}`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();
  const facet = {
    title: name,
    items: data.aggregations[`sterms#${field}`].buckets.map((f) => ({
      name: f.key,
      display_name: f.key,
      count: f.doc_count,
    })),
  };
  return facet;
}

export async function tableExport({ fqn }: { fqn: string }) {
  const endpoint = `tables/${fqn}/export`;
  const res = await omdFetch({ endpoint });
  const data = await res.text();
  return data;
}

export async function listGlossaries() {
  const endpoint = `glossaries`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();
  return data;
}

export async function getGlossaryTerm({
  fqn,
  fields,
}: {
  fqn: string;
  fields?: string;
}) {
  const searchParams = new URLSearchParams();
  if (fields) {
    searchParams.set("fields", fields);
  }
  const endpoint = `glossaryTerms/name/${fqn}?${searchParams.toString()}`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();
  return data;
}

export async function listGlossaryTerms({
  glossaryId,
  fields,
  directChildrenOf,
}: {
  glossaryId?: string;
  fields: string;
  directChildrenOf: string;
}) {
  const searchParams = new URLSearchParams();
  if (glossaryId) {
    searchParams.set("glossaryId", glossaryId);
  }
  searchParams.set("fields", fields);
  searchParams.set("directChildrenOf", directChildrenOf);
  const endpoint = `glossaryTerms?${searchParams.toString()}`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();
  return data;
}
