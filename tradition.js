/* The complete calendar remains readable when JavaScript is unavailable. */
(function () {
  "use strict";

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("sl")
      .replace(/\s+/g, " ")
      .trim();
  }

  function currentMonth() {
    try {
      return Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Europe/Ljubljana",
          month: "numeric",
        }).format(new Date()),
      );
    } catch (_) {
      return new Date().getMonth() + 1;
    }
  }

  function initialMonth() {
    const requested = new URLSearchParams(window.location.search).get("mesec");
    if (requested !== null && /^(?:[0-9]|1[0-2])$/.test(requested))
      return Number(requested);
    return currentMonth();
  }

  function enhance(calendar) {
    const controls = calendar.querySelector("[data-nameday-controls]");
    const month = calendar.querySelector("[data-nameday-month]");
    const search = calendar.querySelector("[data-nameday-search]");
    const status = calendar.querySelector("[data-nameday-status]");
    const empty = calendar.querySelector("[data-nameday-empty]");
    const entries = Array.from(calendar.querySelectorAll("[data-nameday-entry]"));
    const groups = Array.from(calendar.querySelectorAll("[data-nameday-group]"));

    if (!controls || !month || !search || !entries.length) return;

    const records = entries.map(function (entry) {
      return {
        element: entry,
        month: Number(entry.dataset.month),
        text: normalize(entry.dataset.search || entry.textContent),
      };
    });

    function filter() {
      const selectedMonth = Number(month.value);
      const query = normalize(search.value);
      const terms = query ? query.split(" ") : [];
      let count = 0;

      records.forEach(function (record) {
        const visible =
          (selectedMonth === 0 || record.month === selectedMonth) &&
          terms.every(function (term) {
            return record.text.includes(term);
          });
        record.element.hidden = !visible;
        if (visible) count += 1;
      });

      groups.forEach(function (group) {
        group.hidden = !Array.from(
          group.querySelectorAll("[data-nameday-entry]"),
        ).some(function (entry) {
          return !entry.hidden;
        });
      });

      if (empty) empty.hidden = count !== 0;
      if (status) status.textContent = "Prikazanih godov: " + count + ".";
    }

    month.value = String(initialMonth());
    if (month.value === "") month.value = "0";

    month.addEventListener("change", filter);
    search.addEventListener("input", function () {
      month.value = "0";
      filter();
    });
    controls.addEventListener("submit", function (event) {
      event.preventDefault();
      filter();
    });

    filter();
    controls.hidden = false;
  }

  function initialize() {
    document.querySelectorAll("[data-nameday-calendar]").forEach(enhance);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
