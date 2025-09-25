import { safeQuerySelector } from "./index";

const myDiv = safeQuerySelector(
  ".my-div",
  (el): el is HTMLDivElement => el instanceof HTMLDivElement,
);
console.assert(
  myDiv instanceof HTMLDivElement,
  "myDiv should be an instance of HTMLDivElement",
);

const mySpan = safeQuerySelector(
  ".my-span",
  (el): el is HTMLSpanElement => el instanceof HTMLSpanElement,
);
console.assert(
  mySpan instanceof HTMLSpanElement,
  "mySpan should be an instance of HTMLSpanElement",
);

try {
  // This should throw an error if no element is found
  safeQuerySelector(
    ".non-existent",
    (el): el is HTMLDivElement => el instanceof HTMLDivElement,
  );
  console.assert(
    false,
    "This line should not be reached if the selector is correct and no element is found",
  );
} catch (e) {
  console.assert(
    e instanceof Error,
    "An error should be thrown for non-existent elements",
  );
  console.log(
    "Caught expected error for non-existent element:",
    e instanceof Error ? e.message : String(e),
  );
}
