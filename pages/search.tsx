import { renderToString } from "react-dom/server";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  InstantSearchServerState,
  InstantSearchSSRProvider,
  getServerState,
  ClearRefinements,
  HierarchicalMenu,
  Menu,
  RefinementList,
  SearchBox,
  Hits,
  Pagination,
  Highlight,
} from "react-instantsearch";
import routing from "@/helpers/searchRouting";

type SearchPageProps = {
  serverState?: InstantSearchServerState;
  serverUrl: string;
};

const searchClient = algoliasearch(
  "latency",
  "6be0576ff61c053d5f9a3225e2a90f76"
);

function Panel({
  header,
  children,
}: {
  header: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ais-Panel">
      {header && <div className="ais-Panel-header">{header}</div>}
      <div className="ais-Panel-body">{children}</div>
    </div>
  );
}

function Hit({ hit }: { hit: any }) {
  return (
    <div>
      <Highlight attribute="name" hit={hit} />
    </div>
  );
}

export default function SearchPage({
  serverState,
  serverUrl,
}: SearchPageProps) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        searchClient={searchClient}
        indexName="instant_search"
        routing={routing(serverUrl)}
      >
        <div className="search-panel">
          <div className="search-panel__filters">
            <ClearRefinements />

            <Panel header="Tree">
              <HierarchicalMenu
                attributes={[
                  "hierarchicalCategories.lvl0",
                  "hierarchicalCategories.lvl1",
                  "hierarchicalCategories.lvl2",
                  "hierarchicalCategories.lvl3",
                ]}
              />
            </Panel>

            <Panel header="Category">
              <Menu attribute="categories" />
            </Panel>

            <Panel header="Brands">
              <RefinementList attribute="brand" />
            </Panel>
          </div>

          <div className="search-panel__results">
            <SearchBox className="searchbox" placeholder="Search" />

            <Hits hitComponent={Hit} />

            <div className="pagination">
              <Pagination />
            </div>
          </div>
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

export async function getServerSideProps({ req }) {
  const protocol = req.headers.referer?.split("://")[0] || "https";
  const serverUrl = `${protocol}://${req.headers.host}${req.url}`;
  const serverState = await getServerState(
    <SearchPage serverUrl={serverUrl} />,
    { renderToString }
  );

  return {
    props: {
      serverState,
      serverUrl,
    },
  };
}
