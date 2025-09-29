import { Dataset, Organization } from "@portaljs/ckan";
import {
  privateToPublicDatasetName,
  privateToPublicOrgName,
  publicToPrivateOrgName,
} from "./utils";
import CkanRequest, { CkanResponse } from "@portaljs/ckan-api-client-js";
import { dataProductToDataset, versionToActivity } from "./dataset";
import { omdFetch } from "../omd";

const DMS = process.env.NEXT_PUBLIC_DMS;
const mainOrg = process.env.NEXT_PUBLIC_ORG;

export const getOrganization = async ({
  name,
  include_datasets = false,
}: {
  name: string;
  include_datasets?: boolean;
}) => {
  const privateName = publicToPrivateOrgName(name);

  const organization = await CkanRequest.get<CkanResponse<Organization>>(
    `organization_show?id=${privateName}&include_datasets=${include_datasets}`,
    { ckanUrl: DMS }
  );

  if (include_datasets) {
    organization.result.packages.forEach((dataset: Dataset) => {
      dataset.organization.name = name;
      dataset.name = privateToPublicDatasetName(dataset.name);
    });
  }

  const publicName = privateToPublicOrgName(organization.result.name);

  return {
    ...organization.result,
    name: publicName,
    _name: organization.result.name,
  };
};

export async function getDomain({
  name,
}: {
  name: string;
}): Promise<Organization> {
  const searchParams = new URLSearchParams();
  searchParams.set("fields", "");

  const endpoint = `domains/name/${name}?${searchParams.toString()}`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();

  const datasets = await getDomainDataProducts(name);

  const organization = domainToOrg(data);
  organization.package_count = datasets.length;
  organization.packages = datasets;
  organization.activity_stream = await listDomainVersions({
    id: organization.id,
  });

  return organization;
}

export async function getDomainDataProducts(
  domain: string
): Promise<Dataset[]> {
  const searchParams = new URLSearchParams();
  const query = `domains.displayName.keyword:"${domain}" AND entityType.keyword:dataproduct`;
  searchParams.set("q", query);
  searchParams.set("index", "dataAsset");
  const endpoint = `search/query?${searchParams.toString()}`;
  const res = await omdFetch({ endpoint });

  const data = await res.json();
  const datasets = data.hits.hits.map((d) => dataProductToDataset(d._source));
  return datasets;
}

async function listDomainVersions({ id }: { id: string }) {
  const endpoint = `domains/${id}/versions`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();
  const activityStream = data.versions.map((v) =>
    versionToActivity(JSON.parse(v), "organization")
  );
  return activityStream;
}

export const getAllOrganizations = async ({
  detailed = true, // Whether to add organization_show or not
}: {
  detailed?: boolean;
}) => {
  if (!mainOrg) {
    const organizations = await CkanRequest.get<CkanResponse<Organization[]>>(
      `organization_list?all_fields=True`,
      {
        ckanUrl: DMS,
      }
    );

    return organizations.result.map((o) => {
      return { ...o, _name: o.name };
    });
  }

  /*
   * Get hierarchy from root org
   *
   */

  const organizationsTree = await CkanRequest.get<
    CkanResponse<Organization & { children: Organization[]; _name: string }>
  >(`group_tree_section?type=organization&id=${mainOrg}`, {
    ckanUrl: DMS,
  });

  /*
   * Flatten orgs hierarchy, fix name and preserve
   * internal name as `_name`
   *
   */
  const { children, ...parent } = organizationsTree.result;

  let organizations = children.map((c) => {
    const publicName = privateToPublicOrgName(c.name);
    return { ...c, name: publicName, _name: c.name };
  });

  organizations.unshift({ ...parent, _name: parent.name });

  /*
   * Get details for each org
   *
   */
  if (organizations && detailed) {
    organizations = await Promise.all(
      organizations.map(async (o) => {
        const orgDetails = await getOrganization({
          name: o.name,
        });

        return { ...o, ...orgDetails, name: o.name, _name: o._name };
      })
    );
  }

  return organizations;
};

export async function getAllDomains(): Promise<Organization[]> {
  const endpoint = `domains`;
  const res = await omdFetch({ endpoint });
  const data = await res.json();
  return data.data.map((d) => domainToOrg(d));
}

export function domainToOrg(domain: any): Organization {
  return {
    id: domain.id,
    name: domain.fullyQualifiedName,
    title: domain.name,
    display_name: domain.name,
    description: domain.description,
    package_count: 123, // TODO: how should we handle this?
    is_organization: true,
    type: "organization",
    state: "active",
  };
}
