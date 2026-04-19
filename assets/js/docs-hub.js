(function () {
	"use strict";

	function escapeHtml(value) {
		return String(value ?? "")
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	}

	function renderHub(manifest) {
		const titleEl = document.getElementById("hubTitle");
		const subtitleEl = document.getElementById("hubSubtitle");
		const footerEl = document.getElementById("hubFooter");
		const listEl = document.getElementById("hubList");

		if (titleEl && manifest.title) {
			titleEl.textContent = manifest.title;
			document.title = manifest.title;
		}

		if (subtitleEl && manifest.subtitle) {
			subtitleEl.textContent = manifest.subtitle;
		}

		if (footerEl && manifest.footer) {
			footerEl.textContent = manifest.footer;
		}

		if (!listEl) return;

		const docs = Array.isArray(manifest.docs) ? manifest.docs : [];
		if (!docs.length) {
			listEl.innerHTML =
				'<div class="hub-empty">Nenhuma documentação registrada no manifesto.</div>';
			return;
		}

		listEl.innerHTML = docs
			.map((doc) => {
				const title = escapeHtml(doc.title);
				const description = escapeHtml(doc.description);
				const href = escapeHtml(doc.href);
				const actionLabel = escapeHtml(
					doc.actionLabel || "Abrir documentação",
				);
				return `
          <a class="hub-item" href="${href}">
            <span class="hub-item-title">${title}</span>
            <span class="hub-item-desc">${description}</span>
            <span class="hub-item-meta">${actionLabel}</span>
          </a>`;
			})
			.join("");
	}

	const manifest = window.DOCS_MANIFEST || null;
	if (manifest) {
		renderHub(manifest);
	}
})();
