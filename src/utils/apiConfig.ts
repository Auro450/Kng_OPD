export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5001`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
};
