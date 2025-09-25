import { safeQuerySelector } from "../../utils/safe-query-selector/index.js";

const container = safeQuerySelector(
  "#container",
  (el) => el instanceof HTMLElement,
);
const cardTemplate = safeQuerySelector(
  "#card_template",
  (el) => el instanceof HTMLTemplateElement,
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

container.appendChild(
  createCardElement(
    "Frontend System Design: Fundamentals",
    "This is a random content",
  ),
);
