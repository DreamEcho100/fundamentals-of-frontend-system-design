/**
 * @throws
 */
export function safeQuerySelector<TElement extends Element>(
  selector: string,
  is: (el: any) => el is TElement,
  context?: Document | Element,
): TElement;
