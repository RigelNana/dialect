import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { App } from './App'

export type ToneFilter = 'all' | 'level' | 'rising' | 'departing' | 'entering'

export interface MatrixSearch {
  layer: string
  rhymeGroup: string
  tone: ToneFilter
  search: string
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <main className="route-message">没有找到这个研究页面。</main>,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): MatrixSearch => ({
    layer: typeof search.layer === 'string' ? search.layer : 'middle-chinese',
    rhymeGroup: typeof search.rhymeGroup === 'string' ? search.rhymeGroup : 'all',
    tone: typeof search.tone === 'string' && ['all', 'level', 'rising', 'departing', 'entering'].includes(search.tone)
      ? search.tone as ToneFilter
      : 'all',
    search: typeof search.search === 'string' ? search.search : '',
  }),
  component: App,
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
