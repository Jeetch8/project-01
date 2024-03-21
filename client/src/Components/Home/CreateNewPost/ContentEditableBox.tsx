"use client";

import { Ref, useEffect, useRef } from "react";

export default function ContentEditableBox({
  divRef,
}: {
  divRef: Ref<HTMLDivElement>;
}) {
  const vara = "text-blue-500";

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;
    div.addEventListener("input", function (e: any) {
      // Get the current text
      var text = e.target.innerText;

      // Define the regex for the text you want to change the color of
      var regex = /@\w+/g;

      // Check if the specific text is in the current text
      var match = text.match(regex);
      if (match) {
        // Replace the specific text with the same text, but wrapped in a span with a class that changes the color
        match.forEach((item: any) => {
          var coloredText = '<span class="text-blue-500">' + item + "</span>";
          text = text.replace(item, coloredText);
        });
        e.target.innerHTML = text;
        // Place the cursor at the end of the text
        placeCaretAtEnd(e.target);
      }
    });

    function placeCaretAtEnd(el) {
      el.focus();
      if (
        typeof window.getSelection != "undefined" &&
        typeof document.createRange != "undefined"
      ) {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
      }
    }
  }, []);

  return (
    <>
      <div
        ref={divRef}
        contentEditable="true"
        className="p-[10px] outline-none w-[500px]"
      >
        Type here...
      </div>
    </>
  );
}
