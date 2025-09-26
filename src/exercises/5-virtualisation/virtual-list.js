// import { intersectionObserver } from "../../../utils/observer.js";

import { debounce } from "../../utils/debounce.js";
import { isNullable } from "../../utils/is-nullable.js";
import { intersectionObserver } from "../../utils/observer.js";
import { safeQuerySelector } from "../../utils/safe-query-selector/index.js";

/**
 * Standard Margin between cards
 * @type {number}
 */
const MARGIN = 16;

/** @type {Map<string, HTMLElement>} */
const elementsCache = new Map();

/**
 * Returns top and bottom observer elements
 * @returns {[HTMLElement,HTMLElement]}
 */
const getObservers = () => {
  let top = elementsCache.get("#top-observer");
  if (!top) {
    top = safeQuerySelector("#top-observer", (el) => el instanceof HTMLElement);
    elementsCache.set("#top-observer", top);
  }
  let bottom = elementsCache.get("#bottom-observer");
  if (!bottom) {
    bottom = safeQuerySelector(
      "#bottom-observer",
      (el) => el instanceof HTMLElement,
    );
    elementsCache.set("#bottom-observer", bottom);
  }

  return [top, bottom];
};

/**
 * Returns a virtual list container
 * @returns {HTMLElement}
 */
function getVirtualList() {
  const cached = elementsCache.get("#virtual-list");
  if (cached) {
    return cached;
  }
  const el = safeQuerySelector(
    "#virtual-list",
    (el) => el instanceof HTMLElement,
  );
  elementsCache.set("#virtual-list", el);
  return el;
}

/**
 * Returns a main app container
 * @returns {HTMLElement}
 */
function getContainer() {
  const cached = elementsCache.get("#container");
  if (cached) {
    return cached;
  }
  const el = safeQuerySelector("#container", (el) => el instanceof HTMLElement);
  elementsCache.set("#container", el);
  return el;
}

/**
 * Returns `data-y` attribute of the HTMLElement, if value is provided
 * additionally updates the attribute
 *
 * @param {HTMLElement} element
 * @param {string | number | undefined} [value]
 * @returns {number|null}
 */
function y(element, value) {
  if (!isNullable(value)) {
    // element?.setAttribute("data-y", value + "");
    element.dataset.y = value + "";
  }
  // const y = element?.getAttribute("data-y");
  const y = element?.dataset.y;
  // biome-ignore lint/suspicious/noSelfCompare: <explanation>To check for NaN</explanation>
  if (y !== "" && !isNullable(y) && +y === +y) {
    return +y;
  }
  return null;
}

/**
 * Returns a CSS Transform Style string to Move Element by certain amount of pixels
 * @param {number} value - value in pixels
 * @returns {string}
 */
function translateY(value) {
  return `translateY(${value}px)`;
}

/**
 * @template TDataItem
 * Starter skeleton
 */
export class VirtualList {
  /**
   * @param {HTMLElement} root
   * @param {{
   *     getPage: (p: number) => Promise<TDataItem[]>,
   *     getTemplate: (datum: TDataItem, element?: HTMLElement) => HTMLElement,
   *     updateTemplate: (datum: TDataItem, element?: HTMLElement) => HTMLElement,
   *     pageSize: number
   * }} props
   */
  constructor(root, props) {
    this.props = { ...props };
    this.root = root;
    this.startPage = 0;
    this.endPage = 0;
    /** @type {(() => void)[]} */
    this.cleanup = [];
    /** @type {HTMLElement[]} */
    this.pool = [];
    /** Maximum number of elements in the pool */
    this.poolLimit = props.pageSize * 2;
  }

  onCleanup() {
    this.cleanup.forEach((fn) => {
      fn();
    });
  }

  /**
   * Returns an HTML Representation of the component, should have the following structure:
   * #container>
   *    #top-observer+
   *    #virtual-list+
   *    #bottom-observer
   * @returns {string}
   */
  toHTML() {
    /**
     * Part 1 - App Skeleton
     *  @todo
     * @done
     */
    return /* HTML */ `<div id="container">
      <div id="top-observer">Top Observer</div>
      <div id="virtual-list"></div>
      <div id="bottom-observer">Bottom Observer</div>
    </div>`.trim();
  }

  /**
   * @returns void
   */
  #effect() {
    /** @type {number | undefined} */
    let debounceTimeoutId;
    const [instance, timeoutId] = intersectionObserver(
      getObservers(),
      debounce((entries) => this.#handleIntersectionObserver(entries), 300, {
        registerTimeoutId: (id) => {
          debounceTimeoutId = id;
        },
      }),
      { threshold: 0.2 },
    );
    this.cleanup.push(() => {
      instance.disconnect();
      clearTimeout(timeoutId);
      clearTimeout(debounceTimeoutId);
    });
  }

  /**
   * @returns void
   */
  render() {
    this.root.innerHTML = this.toHTML();
    this.cleanup.push(() => {
      this.root.innerHTML = "";
    });
    this.#effect();
  }

  /**
   * Handles observer intersection entries
   * @param {IntersectionObserverEntry[]} entries
   */
  #handleIntersectionObserver(entries) {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;

      switch (entry.target.id) {
        case "bottom-observer": {
          void this.#handleBottomObserver();
          break;
        }
        case "top-observer": {
          if (this.startPage > 0) void this.#handleTopObserver();
          break;
        }
      }
    }
  }

  async #handleBottomObserver() {
    const data = await this.props.getPage(this.endPage++);
    if (data.length === 0 || isNullable(data)) {
      return;
    }

    const container = getContainer();
    const virtualList = getVirtualList();

    if (this.pool.length < this.poolLimit) {
      const fragment = new DocumentFragment();
      for (const datum of data) {
        const element = this.props.getTemplate(datum);
        fragment.appendChild(element);
        this.pool.push(element);
      }
      virtualList.appendChild(fragment);
    } else {
      const [toRecycle, unchanged] = [
        this.pool.slice(0, this.props.pageSize),
        this.pool.slice(this.props.pageSize),
      ];

      this.pool = unchanged.concat(toRecycle);
      this.#updateData(toRecycle, data);
      this.startPage++;
    }

    this.#updateElementsPosition("down");
    container.style.height = `${container.scrollHeight}px`;
  }

  async #handleTopObserver() {
    try {
      const data = await this.props.getPage(--this.startPage);
      if (data.length === 0 || isNullable(data)) {
        return;
      }

      const [toRecycle, unchanged] = [
        //   this.pool.slice(this.props.pageSize, this.pool.length), // Keep bottom elements
        //   this.pool.slice(0, this.props.pageSize), // Recycle top elements
        this.pool.slice(-this.props.pageSize), // Recycle bottom elements
        this.pool.slice(0, this.pool.length - this.props.pageSize), // Keep top elements
      ];

      this.pool = toRecycle.concat(unchanged);
      this.#updateData(toRecycle, data);
      this.#updateElementsPosition("top");
      this.endPage--;
    } catch (error) {
      this.startPage++;
      console.error(error);
      throw error;
    }
  }

  /**
   * Function uses `props.getTemplate` to update the html elements
   * using provided data
   *
   * @param {HTMLElement[]} elements - HTML Elements to update
   * @param {TDataItem[]} data - Data to use for update
   */
  #updateData(elements, data) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const datum = data[i];
      if (isNullable(datum)) {
        throw new Error("Datum is null or undefined");
      }
      this.props.updateTemplate(datum, element);
    }
  }

  /**
   * Move elements on the screen using CSS Transform
   *
   * @param {"top" | "down"} direction
   */
  #updateElementsPosition(direction) {
    const [top, bottom] = getObservers();

    if (direction === "down") {
      for (let i = 0; i < this.pool.length; i++) {
        const [prev, curr] = [this.pool.at(i - 1), this.pool[i]];
        /** @type {number | null} */
        let prevY;
        if (isNullable(curr)) {
          continue;
        }
        // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
        if (isNullable(prev) || isNullable((prevY = y(prev)))) {
          y(curr, 0);
        } else {
          const newY = prevY + MARGIN * 2 + prev.offsetHeight;
          y(curr, newY);
          curr.style.transform = translateY(newY);
        }
      }
    } else if (direction === "top") {
      for (let i = this.pool.length - 1; i >= 0; i--) {
        const [next, curr] = [this.pool.at(i + 1), this.pool[i]];
        if (isNullable(curr)) {
          continue;
        }
        /** @type {number | null} */
        let nextY;
        // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
        if (isNullable(next) || isNullable((nextY = y(next)))) {
          // y(curr, 0);
          continue;
        }

        const newY = nextY - MARGIN * 2 - curr.offsetHeight;
        y(curr, newY);
        curr.style.transform = translateY(newY);
      }
    }

    const [first, last] = [this.pool[0], this.pool.at(-1)];
    if (isNullable(first) || isNullable(last)) {
      return;
    }
    const topY = y(first);
    let bottomY = y(last);
    if (typeof topY !== "number" || typeof bottomY !== "number") {
      return;
    }
    bottomY += last.offsetHeight + MARGIN * 2;

    top.style.transform = translateY(topY - getContainer().scrollTop);
    bottom.style.transform = translateY(bottomY - getContainer().scrollTop);
  }
}
