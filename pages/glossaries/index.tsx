import { TermsList } from "@/components/glossary/TermsList";
import HeroSection from "@/components/_shared/HeroSection";
import Layout from "@/components/_shared/Layout";
import { listGlossaries } from "@/lib/queries/dataset";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import styles from "styles/DatasetInfo.module.scss";

export async function getServerSideProps() {
  const glossaries = await listGlossaries();
  return {
    props: {
      glossaries: glossaries.data,
    },
  };
}

export default function Page({ glossaries }) {
  return (
    <Layout>
      <div className="grid grid-rows-searchpage-hero">
        <HeroSection title="Glossaries" />
        <section className={`grid row-start-3 row-span-2 col-span-full pt-4 `}>
          <div className={`custom-container bg-white ${styles.shadowMd}`}></div>
        </section>
      </div>
      <div className="custom-container bg-white">
        <article className="pt-[30px] pb-[30px]">
          {glossaries.map((g) => {
            return (
              <div key={g.id}>
                <Disclosure>
                  {({ open }) => {
                    return (
                      <>
                        <Disclosure.Button className="flex w-full justify-between px-4 py-2 shadow-lg rounded">
                          <span>{g.displayName}</span>
                          <ChevronUpIcon
                            className={`${
                              open ? "rotate-180 transform" : ""
                            } h-5 w-5 text-purple-500`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel
                          className={"px-4 py-8 space-y-5 shadow-lg rounded"}
                        >
                          {g.description && (
                            <p
                              dangerouslySetInnerHTML={{
                                __html: g.description,
                              }}
                            ></p>
                          )}
                          <div>
                            <TermsList path={g.name} />
                          </div>
                        </Disclosure.Panel>
                      </>
                    );
                  }}
                </Disclosure>
              </div>
            );
          })}
        </article>
      </div>
    </Layout>
  );
}
