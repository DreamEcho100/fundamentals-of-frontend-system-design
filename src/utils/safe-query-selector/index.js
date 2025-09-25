/** @import {safeQuerySelector as SafeQuerySelector} from "./index" */

/** @type {SafeQuerySelector} */
export function safeQuerySelector(selector, is, context = document) {
  const el = context.querySelector(selector);
  if (!el) {
    throw new Error(`Element not found for selector: ${selector}`);
  }
  if (!is(el)) {
    throw new Error(
      `Element found for selector: ${selector}, but it is not of the expected type.`,
    );
  }
  return el;
}
