import { initMockDB } from "../../utils/db.js";
import { safeQuerySelector } from "../../utils/safe-query-selector/index.js";

const db = initMockDB({
  title: "Fundamentals of Frontend System Design",
  body: "Learning to use Intersection Observer",
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

/**
 * @param {string} title
 * @param {string} body
 * @returns {HTMLElement}
 */
function createCardElement(title, body) {
  const element = /** @type {DocumentFragment} */ (
    cardTemplate.content.cloneNode(true)
  ).firstElementChild;
  if (!(element instanceof HTMLElement)) {
    throw new Error("Template content is not an HTMLElement");
  }

  const [cardTitle] = element.getElementsByTagName("h3");
  if (!(cardTitle instanceof HTMLElement)) {
    throw new Error("Card title is not an HTMLElement");
  }
  const [cardBody] = element.getElementsByTagName("section");
  if (!(cardBody instanceof HTMLElement)) {
    throw new Error("Card body is not an HTMLElement");
  }

  cardTitle.textContent = title;
  cardBody.textContent = body;

  return element;
}

/**
 * Exercise - Intersection Observer
 * 1. Create Intersection observer instance and provide a callback to it
 * 2. In the callback use mock db - next function to get the next chunk of data
 * 3. Create a fragment where you chunk all your DOM Mutations
 * 4. Update fragment
 * 5. Append fragment to "list" container
 */
let page = 0;
const observer = new IntersectionObserver(
  async ([entry]) => {
    if (!entry?.isIntersecting) return;

    const data = await db.getPage(page++);
    const fragment = new DocumentFragment();
    for (const item of data) {
      const card = createCardElement(item.title, item.body);
      fragment.appendChild(card);
    }
    list.appendChild(fragment);
  },
  {
    threshold: 0.2,
  },
);
observer.observe(observerElement);
