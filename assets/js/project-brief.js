/* ============================================================
   PROJECT BRIEF DETAIL VIEW
   Reads data-* attributes off each .portfolio-item, builds a
   detail view dynamically, and shows it in the modal overlay.
   No build step, no dependencies — vanilla JS only.
   ============================================================ */
(function () {
    'use strict';

    var backdrop = document.getElementById('briefBackdrop');
    var modal = document.getElementById('briefModal');
    var closeBtn = document.getElementById('briefClose');
    var mediaEl = document.getElementById('briefMedia');
    var badgeEl = document.getElementById('briefBadge');
    var titleEl = document.getElementById('briefTitle');
    var descEl = document.getElementById('briefDescription');
    var tagsEl = document.getElementById('briefTags');
    var actionsEl = document.getElementById('briefActions');

    if (!backdrop || !modal) return; // markup not present — bail safely

    var lastFocusedEl = null;

    /**
     * Parses a "Label::href::variant|Label::href::variant" string
     * (set via data-actions on each card) into an array of action objects.
     * variant is "primary" or "secondary"; defaults to "secondary".
     */
    function parseActions(raw) {
        if (!raw) return [];
        return raw.split('|').map(function (chunk) {
            var parts = chunk.split('::');
            return {
                label: (parts[0] || 'View').trim(),
                href: (parts[1] || '#').trim(),
                variant: (parts[2] || 'secondary').trim()
            };
        });
    }

    function parseTags(raw) {
        if (!raw) return [];
        return raw.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    }

    /** Pulls the data needed for the brief view straight off the card element. */
    function getProjectData(card) {
        var svgSource = card.querySelector('.portfolio-image svg');
        return {
            title: card.dataset.title || card.querySelector('h3') ? (card.dataset.title || card.querySelector('h3').textContent) : 'Project',
            description: card.dataset.description || (card.querySelector('.portfolio-content p') || {}).textContent || '',
            tags: parseTags(card.dataset.tags),
            badge: card.dataset.badge || '',
            actions: parseActions(card.dataset.actions),
            svgMarkup: svgSource ? svgSource.outerHTML : ''
        };
    }

    /** Renders the project data into the modal's DOM nodes. */
    function populateBrief(data) {
        mediaEl.innerHTML = data.svgMarkup;

        if (data.badge) {
            badgeEl.textContent = data.badge;
            badgeEl.hidden = false;
        } else {
            badgeEl.hidden = true;
        }

        titleEl.textContent = data.title;
        descEl.textContent = data.description;

        tagsEl.innerHTML = '';
        data.tags.forEach(function (tag) {
            var span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;
            tagsEl.appendChild(span);
        });

        actionsEl.innerHTML = '';
        data.actions.forEach(function (action) {
            var a = document.createElement('a');
            a.className = 'brief-btn ' + (action.variant === 'primary' ? 'primary' : 'secondary');
            a.href = action.href;
            a.textContent = action.label;
            // External/placeholder links open in a new tab; keep same-page anchors local.
            if (action.href && action.href !== '#') {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            actionsEl.appendChild(a);
        });
    }

    function openBrief(card) {
        lastFocusedEl = document.activeElement;
        populateBrief(getProjectData(card));

        backdrop.hidden = false;
        document.body.classList.add('brief-open');

        // Next frame, trigger the transition + move focus into the dialog.
        requestAnimationFrame(function () {
            backdrop.classList.add('is-visible');
            modal.focus();
        });

        document.addEventListener('keydown', onKeydown);
    }

    function closeBrief() {
        backdrop.classList.remove('is-visible');
        document.body.classList.remove('brief-open');
        document.removeEventListener('keydown', onKeydown);

        // Wait for the closing transition before hiding from the a11y tree.
        var done = false;
        function finish() {
            if (done) return;
            done = true;
            backdrop.hidden = true;
            if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
                lastFocusedEl.focus();
            }
        }
        modal.addEventListener('transitionend', finish, { once: true });
        setTimeout(finish, 400); // fallback in case transitionend doesn't fire
    }

    function onKeydown(e) {
        if (e.key === 'Escape') {
            closeBrief();
            return;
        }
        if (e.key === 'Tab') {
            trapFocus(e);
        }
    }

    /** Keeps Tab/Shift+Tab cycling within the modal while it's open. */
    function trapFocus(e) {
        var focusable = modal.querySelectorAll(
            'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    // ---- Event delegation: one listener handles every current AND future card ----
    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-open-brief]');
        var card = e.target.closest('.portfolio-item');

        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            openBrief(card);
            return;
        }

        if (card && !e.target.closest('a')) {
            // Clicked the card itself (not a specific link inside it).
            openBrief(card);
        }
    });

    // Keyboard activation (Enter / Space) for cards focused via Tab.
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var card = e.target.closest('.portfolio-item');
        if (!card) return;
        e.preventDefault();
        openBrief(card);
    });

    closeBtn.addEventListener('click', closeBrief);

    // Click on the dimmed backdrop (outside the modal) also closes it.
    backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) closeBrief();
    });
})();
