import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchSteamStoreGames } from '../apis/steamApi'

const PAGE_SIZE = 25

export function useSteamStoreGamesQuery(query: string, tag: string) {
  return useInfiniteQuery({
    queryKey: ['steam', 'store-games', query, tag],
    queryFn: ({ pageParam }) =>
      fetchSteamStoreGames({
        query,
        tag: tag === 'all' ? '' : tag,
        start: pageParam,
        count: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextStart ?? undefined,
    staleTime: 1000 * 60 * 10,
  })
}
