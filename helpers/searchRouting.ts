import singletonRouter from "next/router";
import { createInstantSearchRouterNext } from "react-instantsearch-router-nextjs";

const searchRouting = (serverUrl: string | undefined) => ({
  router: createInstantSearchRouterNext({
    singletonRouter,
    serverUrl,
    routerOptions: {
      createURL({ qsModule, routeState, location }) {
        const urlParts = location.href.match(/^(.*?)\/search/);
        const baseUrl = `${urlParts ? urlParts[1] : ""}/`;

        const categoryPath = routeState.treeCat ? routeState.treeCat : "";
        const queryParameters = {};

        if (routeState.query) {
          queryParameters.query = encodeURIComponent(routeState.query);
        }
        if (routeState.page !== 1) {
          queryParameters.page = routeState.page;
        }
        if (routeState.brands) {
          queryParameters.brands = routeState.brands.map(encodeURIComponent);
        }

        const queryString = qsModule.stringify(queryParameters, {
          addQueryPrefix: true,
          arrayFormat: "repeat",
        });

        return `${baseUrl}search/${categoryPath}${queryString}`;
      },
      parseURL({ qsModule, location }) {
        const pathnameMatches = location.pathname.match(/search\/(.*?)\/?$/);
        let treeCat = decodeURIComponent(
          (pathnameMatches && pathnameMatches[1]) || ""
        );
        const {
          query = "",
          page,
          brands = [],
          category,
        } = qsModule.parse(location.search.slice(1));
        // `qs` does not return an array when there's a single value.
        const allBrands = Array.isArray(brands)
          ? brands
          : [brands].filter(Boolean);

        console.log("treeCat", treeCat);
        return {
          query: decodeURIComponent(query),
          page,
          brands: allBrands.map(decodeURIComponent),
          category,
          treeCat,
        };
      },
    },
  }),
  stateMapping: {
    stateToRoute(uiState) {
      // refer to uiState docs for details: https://www.algolia.com/doc/api-reference/widgets/ui-state/js/
      console.log("uiState", uiState);
      return {
        query: uiState.instant_search.query,
        page: uiState.instant_search.page,
        brands:
          uiState.instant_search.refinementList &&
          uiState.instant_search.refinementList.brand,
        category:
          uiState.instant_search.menu && uiState.instant_search.menu.categories,
        treeCat:
          uiState.instant_search.hierarchicalMenu &&
          uiState.instant_search.hierarchicalMenu[
            "hierarchicalCategories.lvl0"
          ] &&
          uiState.instant_search.hierarchicalMenu[
            "hierarchicalCategories.lvl0"
          ].join("/"),
      };
    },

    routeToState(routeState) {
      // console.log("routeState", routeState);
      const hierarchicalMenu = {};
      if (routeState.treeCat) {
        hierarchicalMenu["hierarchicalCategories.lvl0"] =
          routeState.treeCat.split("/");
      }
      // refer to uiState docs for details: https://www.algolia.com/doc/api-reference/widgets/ui-state/js/
      return {
        // eslint-disable-next-line camelcase
        instant_search: {
          query: routeState.query,
          page: routeState.page,
          hierarchicalMenu,
          menu: {
            categories: routeState.category,
          },
          refinementList: {
            brand: routeState.brands,
          },
        },
      };
    },
  },
});

export default searchRouting;
