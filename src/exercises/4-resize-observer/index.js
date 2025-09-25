/*
 * 1. Initiate Resize observer
 * 2. Implement callback - use inlineSize and blockSize of the entries for width and height
 * 3. If width and height is less than 150px
 *   3.1 - Apply border-radius: 100%
 *   3.2 - Apply border-width: 4px
 * 4. If width and height is more than 150px = unset the properties above
 * 5. All 4 boxes should use same observer
 */

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { inlineSize: width, blockSize: height } = entry
      .contentBoxSize[0] ?? { inlineSize: 0, blockSize: 0 };
    if (width < 150 && height < 150) {
      /** @type {HTMLElement} */ (entry.target)?.style?.setProperty(
        "border-radius",
        "100%",
      );
      /** @type {HTMLElement} */ (entry.target).style.setProperty(
        "border-width",
        "4px",
      );
    } else {
      /** @type {HTMLElement} */ (entry.target)?.style?.setProperty(
        "border-radius",
        null,
      );
      /** @type {HTMLElement} */ (entry.target).style.setProperty(
        "border-width",
        null,
      );
    }
  }
});

document.querySelectorAll(".box").forEach((box) => {
  resizeObserver.observe(box, { box: "border-box" });
});
