import Head from "next/head";
import MiniSearch from "minisearch";
import { useState } from "react";
import SearchHero from "../components/dataset/_shared/SearchHero";
import ListOfOrgs from "../components/organization/ListOfOrganizations";
import Layout from "../components/_shared/Layout";
import { Organization } from "@portaljs/ckan";
import { getAllOrganizations } from "@/lib/queries/orgs";
import { OrganizationPageStructuredData } from "@/components/schema/OrganizationPageStructuredData";

export async function getServerSideProps() {
  const orgs = await getAllOrganizations({ detailed: true });
  return {
    props: {
      orgs,
    },
  };
}

export default function OrgsPage({ orgs }): JSX.Element {
  const miniSearch = new MiniSearch({
    fields: ["description", "display_name"], // fields to index for full-text search
    storeFields: ["description", "display_name", "image_display_url", "name"], // fields to return with search results
  });
  miniSearch.addAll(orgs);
  return (
    <>
      <OrganizationPageStructuredData />
      <Main miniSearch={miniSearch} orgs={orgs} />
    </>
  );
}

function Main({
  miniSearch,
  orgs,
}: {
  miniSearch: MiniSearch<any>;
  orgs: Array<Organization>;
}) {
  const [searchString, setSearchString] = useState("");
  return (
    <>
      <Layout>
        <SearchHero
          title="Organizations"
          searchValue={searchString}
          onChange={setSearchString}
        />

        <main className="custom-container py-8">
          <ListOfOrgs
            orgs={orgs}
            searchString={searchString}
            miniSearch={miniSearch}
          />
        </main>
      </Layout>
    </>
  );
}
