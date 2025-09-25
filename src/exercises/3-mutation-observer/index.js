import { initMockDB } from "../../utils/db.js";
import { safeQuerySelector } from "../../utils/safe-query-selector/index.js";
import { createCardElement, getHeading } from "./utils.js";

const SUPPORTED_ELEMENTS = new Set(["/h1", "/h2", "/h3", "/h4", "/h5", "/h6"]);

const db = initMockDB({
  title: "Fundamentals of Frontend System Design",
  body: "Learning to use Mutation Observer",
});
const cardTemplate = safeQuerySelector(
  "#card_template",
  (el) => el instanceof HTMLTemplateElement,
);
const list = safeQuerySelector("#list", (el) => el instanceof HTMLElement);
const observerElement = safeQuerySelector(
  "#bottom-observer",
  (el) => el instanceof HTMLDivElement,
);

const mutationObserver = new MutationObserver((_) => {
  /*
   * @todo
   *
   * 1. Loop through mutations (first arg of callback)
   * 2. use mutation.type === 'characterData'
   * 3. When the content matches with any supported tag in SUPPORTED_ELEMENTS
   *    use getHeading function to convert text to HTMLHeading element
   * 4. Replace the node with a newly created node
   * 5. Keep focus on the element
   */

  for (let i = 0; i < _.length; i++) {
    const mutation = _[i];
    if (!mutation) continue;

    if (
      mutation.type !== "characterData" ||
      !mutation.target.textContent ||
      !SUPPORTED_ELEMENTS.has(mutation.target.textContent) ||
      !(mutation.target instanceof Text)
    )
      continue;

    const heading = getHeading(mutation.target);
    if (!heading) continue;

    mutation.target.replaceWith(heading);
    heading.focus();
  }
});
mutationObserver.observe(document.body, {
  characterData: true,
  subtree: true,
});
let page = 0;
const observer = new IntersectionObserver(
  async ([entry]) => {
    if (!entry?.isIntersecting) return;

    const data = await db.getPage(page++);
    const fragment = new DocumentFragment();
    for (const item of data) {
      const card = createCardElement({
        title: item.title,
        body: item.body,
        cardTemplate,
      });
      fragment.appendChild(card);
    }
    list.appendChild(fragment);
  },
  {
    threshold: 0.2,
  },
);
observer.observe(observerElement);
