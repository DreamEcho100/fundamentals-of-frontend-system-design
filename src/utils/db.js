/**
 * @typedef {{
 *  title: string;
 *  body: string;
 * }} Post
 */

/**
 * @param {Post} sample
 * @param {number} count
 * @param {number} page
 */
export function initMockDB(sample, count = 100, page = 10) {
  /** @type {Post[]} */
  const data = new Array(count).fill(null).map((_, i) => ({
    title: `[Entry ${i}] - ${sample.title}`,
    body: `[Entry ${i}] - ${sample.body}`,
  }));

  // Array.from({ length: count }, (_, i) => {
  //   return Object.fromEntries(
  //     Object.entries(sample).map(([k, v]) => [k, `[Entry ${i}] - ${v}`]),
  //   );
  // }); // This will chunk the data into pages

  /** @type {Post[][]} */
  const pages = Array.from(
    { length: Math.ceil(data.length / page) },
    (x, i) => {
      const start = i * page;
      const end = start + page;
      return data.slice(start, end);
    },
  );

  let index = -1;
  /**
   * @param {number} pointer
   * @return {Promise<Post[]>}
   */
  function getPage(pointer) {
    return new Promise((res) => {
      setTimeout(() => {
        if (pointer < 0 || pointer > pages.length - 1) {
          res([]);
        } else {
          index = pointer;
          const pageData = pages[index];
          if (!pageData) {
            res([]);
            return;
          }
          res(pageData);
        }
      }, 1000);
    });
  }
  return { getPage };
}
