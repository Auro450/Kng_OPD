export const getApiBaseUrl = (): string => {
  return (process.env.NEXT_PUBLIC_API_URL || "https://15-206-97-54.nip.io");
};
