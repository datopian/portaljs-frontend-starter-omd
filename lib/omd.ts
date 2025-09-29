export function omdFetch({ endpoint }: { endpoint: string }) {
  return fetch(`${process.env.NEXT_PUBLIC_DMS}/api/v1/${endpoint}`, {
    headers: {
      authorization: `Bearer ${process.env.OMD_TOKEN}`,
    },
  });
}
