(() => {
  const stackEndingExamples = () => {
    document.querySelectorAll("[data-filterable-table] tbody td").forEach((cell) => {
      const columnNumber = cell.cellIndex + 1;

      if (columnNumber < 5 || cell.dataset.examplesStacked === "true") {
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

  const escapeHtml = (value) => value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const addTooltipBreaks = (value) => {
    const protectedText = value
      .replaceAll("ед.", "ед§")
      .replaceAll("мн.", "мн§");

    return protectedText
      .replace(/\. /g, ".<br>")
      .replace(/; /g, ";<br>")
      .replace(/: (Часто|Частые|Чередования|Исключения|После|Полная|Краткая|Форму|Это одна|Возможны|Особые)/g, ":<br>$1")
      .replaceAll("ед§", "ед.")
      .replaceAll("мн§", "мн.");
  };

  const emphasizeEndings = (value) => escapeHtml(addTooltipBreaks(value))
    .replace(/&lt;br&gt;/g, "<br>")
    .replace(
      /(^|[\s:;,()./])(-[a-ząćęłńóśźż]+|ø|n-)(?=$|[\s:;,()./])/gi,
      "$1<strong>$2</strong>",
    );

  const setupRichTooltips = () => {
    document.querySelectorAll(".has-tip[title]").forEach((cell) => {
      const tooltipText = cell.getAttribute("title");

      if (!tooltipText) {
        return;
      }

      cell.removeAttribute("title");
      cell.setAttribute("tabindex", "0");

      const tooltip = document.createElement("span");
      tooltip.className = "tip-content";
      tooltip.innerHTML = emphasizeEndings(tooltipText);
      cell.append(tooltip);

      const updatePosition = () => {
        const rect = cell.getBoundingClientRect();
        const left = Math.min(rect.left, window.innerWidth - 540);
        const top = Math.min(rect.bottom + 8, window.innerHeight - 180);

        tooltip.style.setProperty("--tip-left", `${Math.max(12, left)}px`);
        tooltip.style.setProperty("--tip-top", `${Math.max(12, top)}px`);
      };

      cell.addEventListener("mouseenter", updatePosition);
      cell.addEventListener("focus", updatePosition);
    });
  };

  const markEndingTokens = () => {
    document.querySelectorAll(".has-tip code").forEach((code) => {
      if (/^-/.test(code.textContent.trim()) || code.textContent.trim() === "ø") {
        code.classList.add("ending-token");
      }
    });
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
  markEndingTokens();
  setupRichTooltips();
  setupFloatingHeaders();
})();
