import { initMockDB } from "../../utils/db.js";
import { safeQuerySelector } from "../../utils/safe-query-selector/index.js";
import { VirtualList } from "./virtual-list.js";

const container = document.body;
const template = safeQuerySelector(
  "#card_template",
  (el) => el instanceof HTMLTemplateElement,
);
const DB = initMockDB({
  title: "Frontend System Design",
  body: "Learning about virtualization",
});

/**
 * @param {{ title: string, body: string}} datum
 * @param {HTMLElement | null | undefined} [element]
 * @returns {HTMLElement}
 */
function createOrUpdateCard(datum, element) {
  const card =
    element ??
    /** @type {HTMLElement} */ (template.content.cloneNode(true))
      .firstElementChild;
  if (!(card instanceof HTMLElement)) {
    throw new Error("Template does not contain a valid HTMLElement");
  }
  const title = safeQuerySelector(
    ".card__title",
    (el) => el instanceof HTMLElement,
    card,
  );
  const body = safeQuerySelector(
    ".card__body__content",
    (el) => el instanceof HTMLElement,
    card,
  );
  title.textContent = datum.title;
  body.textContent = datum.body;
  return card;
}

const list = new VirtualList(container, {
  getPage: (page) => DB.getPage(page),
  getTemplate: createOrUpdateCard,
  pageSize: 10,
  updateTemplate: createOrUpdateCard,
});
list.render();
