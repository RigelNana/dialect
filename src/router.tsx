import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { App } from './App'

export interface MatrixSearch {
  layer: string
  she: string
  tone: string
  query: string
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
    she: typeof search.she === 'string' ? search.she : '全部',
    tone: typeof search.tone === 'string' ? search.tone : '全部',
    query: typeof search.query === 'string' ? search.query : '',
  }),
  component: App,
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
