/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.body
 * @param {HTMLTemplateElement} props.cardTemplate
 * @returns {HTMLElement}
 */
export function createCardElement(props) {
  const element = /** @type {DocumentFragment} */ (
    props.cardTemplate.content.cloneNode(true)
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

  cardTitle.textContent = props.title;
  cardBody.textContent = props.body;

  return element;
}

/**
 * @param {Text} textNode
 * @returns {HTMLElement|null}
 */
export function getHeading(textNode) {
  /** @type {HTMLElement} */
  let element;
  if (textNode.textContent.startsWith("/h3")) {
    element = document.createElement("h3");
  } else if (textNode.textContent.startsWith("/h2")) {
    element = document.createElement("h2");
  } else if (textNode.textContent.startsWith("/h1")) {
    element = document.createElement("h1");
  } else {
    return null;
  }
  element.textContent = element.textContent.slice(3);
  element.setAttribute("contenteditable", "true");
  element.textContent =
    element.textContent === "" ? "Heading" : element.textContent;
  return element;
}
