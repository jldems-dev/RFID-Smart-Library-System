import useSWR from "swr";

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("[v0] Fetcher error:", error);
    throw error;
  }
};

export const useUsers = (
  page = 1,
  limit = 10,
  filters?: { search?: string; type?: string; status?: string },
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters?.search && { search: filters.search }),
    ...(filters?.type && { type: filters.type }),
    ...(filters?.status && { status: filters.status }),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/users?${queryParams.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 },
  );

  return {
    users: Array.isArray(data?.data) ? data.data : [],
    total:
      typeof data?.pagination?.total === "number" ? data.pagination.total : 0,
    isLoading,
    error: error?.message || error,
    mutate,
  };
};

export const useBooks = (
  page = 1,
  limit = 10,
  filters?: { search?: string; status?: string },
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters?.search && { search: filters.search }),
    ...(filters?.status && { status: filters.status }),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/books?${queryParams.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 },
  );

  return {
    books: Array.isArray(data?.data) ? data.data : [],
    total:
      typeof data?.pagination?.total === "number" ? data.pagination.total : 0,
    isLoading,
    error: error?.message || error,
    mutate,
  };
};

export const useTransactions = (
  page = 1,
  limit = 10,
  filters?: { search?: string; status?: string; type?: string },
) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters?.search && { search: filters.search }),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.type && { type: filters.type }),
  });
  const { data, error, isLoading, mutate } = useSWR(
    `/api/transactions?${queryParams.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 },
  );

  return {
    transactions: Array.isArray(data?.data) ? data.data : [],
    total:
      typeof data?.pagination?.total === "number" ? data.pagination.total : 0,
    isLoading,
    error: error?.message || error,
    mutate,
  };
};

export const useOverdueTransactions = (page = 1, limit = 10) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const { data, error, isLoading } = useSWR(
    `/api/transactions/overdue?${queryParams.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 },
  );

  return {
    transactions: Array.isArray(data?.data) ? data.data : [],
    total:
      typeof data?.pagination?.total === "number" ? data.pagination.total : 0,
    isLoading,
    error: error?.message || error,
  };
};
