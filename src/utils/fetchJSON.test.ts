import { fetchJSON } from "./fetchJSON";

const result = { to: "abc", from: "def" };

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(result),
  })
) as any;

beforeEach(() => {
  (global.fetch as any).mockClear();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("fetchJSON", () => {
  test("happy path returns JSON result", async () => {
    expect(await fetchJSON("test")).toBe(result);
  });
});
