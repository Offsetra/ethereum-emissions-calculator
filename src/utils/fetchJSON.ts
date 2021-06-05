/** Util to abstract away some boilerplate, and make parent functions easier to test (by mocking this fn!) */
export const fetchJSON = async <T = {}>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const json = await res.json();
    throw json;
  }
  const data = await res.json();
  return data;
};
