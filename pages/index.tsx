import type { InferGetServerSidePropsType } from "next";
import MainSection from "../components/home/mainSection/MainSection";
import { searchDataProducts, searchDatasets } from "@/lib/queries/dataset";
import { getAllDomains, getAllOrganizations } from "@/lib/queries/orgs";
import HeroSectionLight from "@/components/home/heroSectionLight";
import { HomePageStructuredData } from "@/components/schema/HomePageStructuredData";

export async function getServerSideProps() {
  // const datasets = await searchDatasets({
  //   offset: 0,
  //   limit: 5,
  //   tags: [],
  //   groups: [],
  //   orgs: [],
  //   type: "dataset",
  // });

  const datasets = await searchDataProducts({
    offset: 0,
    limit: 5,
    tags: [],
    groups: [],
    orgs: [],
  });

  // const orgs = await getAllOrganizations({ detailed: true });
  const orgs = await getAllDomains()
  const stats = {
    datasetCount: datasets.count,
    orgCount: orgs.length,
  };
  return {
    props: {
      datasets: datasets.datasets,
      orgs,
      stats,
    },
  };
}

export default function Home({
  datasets,
  orgs,
  stats,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <>
      <HomePageStructuredData />
      <HeroSectionLight stats={stats} />
      <MainSection datasets={datasets} />
    </>
  );
}
