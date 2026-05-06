(() => {
  const stackEndingExamples = () => {
    document.querySelectorAll("[data-filterable-table] tbody td").forEach((cell) => {
      const columnNumber = cell.cellIndex + 1;

      if (columnNumber < 6 || cell.dataset.examplesStacked === "true") {
        return;
      }

      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();

      while (textNode) {
        const separatorIndex = textNode.nodeValue.indexOf(": ");

        if (separatorIndex !== -1) {
          const beforeSeparator = textNode.nodeValue.slice(0, separatorIndex + 1);
          const afterSeparator = textNode.nodeValue.slice(separatorIndex + 2);
          const fragment = document.createDocumentFragment();

          fragment.append(document.createTextNode(beforeSeparator));
          fragment.append(document.createElement("br"));

          if (afterSeparator) {
            fragment.append(document.createTextNode(afterSeparator));
          }

          textNode.replaceWith(fragment);
          cell.dataset.examplesStacked = "true";
          return;
        }

        textNode = walker.nextNode();
      }
    });
  };

  const parseColumns = (value) => {
    if (!value) {
      return null;
    }

    return value.split(",").map((item) => Number(item.trim())).filter(Boolean);
  };

  document.querySelectorAll("[data-table-filter]").forEach((filter) => {
    const tableId = filter.dataset.tableFilter;
    const table = document.querySelector(`[data-filterable-table="${tableId}"]`);
    const buttons = filter.querySelectorAll("button[data-columns]");

    if (!table || buttons.length === 0) {
      return;
    }

    const setFilter = (button) => {
      const visibleColumns = parseColumns(button.dataset.columns);

      table.querySelectorAll("tr").forEach((row) => {
        Array.from(row.children).forEach((cell, index) => {
          const columnNumber = index + 1;
          cell.hidden = visibleColumns !== null && !visibleColumns.includes(columnNumber);
        });
      });

      buttons.forEach((currentButton) => {
        currentButton.classList.toggle("is-active", currentButton === button);
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => setFilter(button));
    });
  });

  stackEndingExamples();
})();
