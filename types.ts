type PoolsResponse = {
  pools: {
    updatedAt: string,
  }[],
}

interface GraphQLResponse<T> {
  data?: T,
  errors?: Array<{
    message: string,
    locations: Array<{
      line: number,
      column: number,
    }>,
    extensions?: {
      code: string,
    },
  }>,
}

export {
  PoolsResponse,
  GraphQLResponse 
};
