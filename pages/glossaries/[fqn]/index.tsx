import { TermsList } from "@/components/glossary/TermsList";
import { getGlossaryTerm } from "@/lib/queries/dataset";
import { LinkIcon } from "@heroicons/react/20/solid";
import Layout from "@/components/_shared/Layout";
import HeroSection from "@/components/_shared/HeroSection";
import TermsNavCrumbs from "@/components/glossary/TermsNavCrumbs";

export async function getServerSideProps(context) {
  const fqn = context.params.fqn;
  const term = await getGlossaryTerm({
    fqn,
    fields: "children,parent,relatedTerms,parent,relatedTerms",
  });
  return {
    props: { term },
  };
}

export default function TermPage({ term }) {
  const relatedTerms = term?.relatedTerms;

  return (
    <>
      <Layout>
        <div className="">
          <div className="grid grid-rows-searchpage-hero mb-5">
            <TermsNavCrumbs term={term} />
            <HeroSection title={term?.displayName ?? term?.name} />
          </div>
          <div className="custom-container bg-white space-y-5 rounded shadow-lg p-4">
            <div dangerouslySetInnerHTML={{ __html: term?.description }}></div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <LinkIcon className="mr-1 h-4 w-4" />
                Related terms:{" "}
                <div className="ml-1">
                  {!!relatedTerms?.length
                    ? relatedTerms.map((rt) => {
                        return <span>{rt.name}</span>; // <GlossaryTermChipLink term={rt} />;
                      })
                    : "None"}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Terms
              </p>
              <TermsList key={term.id} path={term?.fullyQualifiedName ?? ""} />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
