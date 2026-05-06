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

  const buildFloatingHeader = (table, floatingHeader) => {
    const headerRow = table.querySelector("thead tr");

    if (!headerRow) {
      return;
    }

    const cloneTable = document.createElement("table");
    const cloneHead = document.createElement("thead");
    const cloneRow = document.createElement("tr");

    Array.from(headerRow.children).forEach((cell) => {
      if (cell.hidden) {
        return;
      }

      const cloneCell = cell.cloneNode(true);
      const width = `${cell.getBoundingClientRect().width}px`;

      cloneCell.style.width = width;
      cloneCell.style.minWidth = width;
      cloneRow.append(cloneCell);
    });

    cloneHead.append(cloneRow);
    cloneTable.append(cloneHead);
    floatingHeader.replaceChildren(cloneTable);
  };

  const setupFloatingHeaders = () => {
    document.querySelectorAll("[data-filterable-table]").forEach((table) => {
      const floatingHeader = document.createElement("div");

      floatingHeader.className = "floating-table-header";
      floatingHeader.hidden = true;
      document.body.append(floatingHeader);

      const update = () => {
        const rect = table.getBoundingClientRect();
        const shouldShow = rect.top < 0 && rect.bottom > 80;

        if (!shouldShow) {
          floatingHeader.hidden = true;
          return;
        }

        floatingHeader.hidden = false;
        floatingHeader.style.left = `${rect.left}px`;
        floatingHeader.style.width = `${rect.width}px`;
        buildFloatingHeader(table, floatingHeader);

        const cloneTable = floatingHeader.querySelector("table");

        if (cloneTable) {
          cloneTable.style.transform = `translateX(${-table.scrollLeft}px)`;
        }
      };

      table.addEventListener("scroll", update);
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
    });
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
      button.addEventListener("click", () => {
        setFilter(button);
        window.dispatchEvent(new Event("scroll"));
      });
    });
  });

  stackEndingExamples();
  setupFloatingHeaders();
})();
