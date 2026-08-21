/**
 * Lead-capture dialog: "Book a call" opens this instead of a mailto:
 * link. Native <dialog> (see css/base.css .lead-dialog) gives us focus
 * handling, Escape-to-close, and the ::backdrop for free.
 *
 * Submission path, in priority order:
 *   1. Web3Forms — a form-backend relay: the browser POSTs straight to
 *      their API, they email it to FALLBACK_EMAIL server-side. To the
 *      visitor this looks like an ordinary form submit (no mail client
 *      popup, stays on the page). Free tier, no backend of our own.
 *      Enable by setting WEB3FORMS_ACCESS_KEY below (get one free at
 *      web3forms.com).
 *   2. Supabase — disabled for now. The table + RLS policy are correct
 *      (verified directly in Postgres via `set role anon; insert ...` —
 *      that succeeds), but this project's REST/Data API gateway rejects
 *      the same insert as an RLS violation regardless of key type, and
 *      survived a project restart. That's a platform-side issue open
 *      with Supabase, not a config problem here. Flip SUPABASE_ENABLED
 *      to true to re-enable once that's fixed (credentials are already
 *      correct and left in place).
 *   3. mailto — last-resort fallback if neither above is configured, so
 *      the CTA always does *something* even with zero setup.
 */
(function () {
  var WEB3FORMS_ACCESS_KEY = "6c5db2b1-7811-41fc-b254-02caed64bd47";

  var SUPABASE_ENABLED = false;
  var SUPABASE_URL = "https://xovsvcazxewmajvzgxqu.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_BB47OM2IZvH2vUk3VLO2GQ_IBNRb6du";

  var FALLBACK_EMAIL = "admin@pedalpanel.com";

  var isWeb3FormsConfigured = WEB3FORMS_ACCESS_KEY.indexOf("YOUR_WEB3FORMS") === -1;

  var dialog = document.getElementById("lead-dialog");
  if (!dialog) return;

  var form = document.getElementById("lead-form");
  var errorEl = document.getElementById("lead-form-error");
  var successEl = document.getElementById("lead-success");
  var eyebrowEl = document.getElementById("lead-form-eyebrow");
  var submitBtn = form.querySelector(".lead-submit");
  var submitLabel = form.querySelector(".lead-submit-label");

  var AUDIENCE_LABEL = {
    advertiser: "For advertisers",
    shop: "For rental shops",
  };

  var openDialog = function (trigger) {
    var audience = trigger.dataset.audience || "advertiser";
    dialog.dataset.audience = audience;
    if (eyebrowEl) {
      eyebrowEl.textContent = AUDIENCE_LABEL[audience] || "Book a call";
    }
    errorEl.hidden = true;
    successEl.hidden = true;
    form.hidden = false;
    form.reset();
    dialog.showModal();
  };

  document.querySelectorAll("[data-open-lead-form]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openDialog(btn);
    });
  });

  dialog.querySelectorAll("[data-close-lead-form]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      dialog.close();
    });
  });

  // Click on the backdrop (i.e. directly on the dialog element, outside
  // its content box) closes it.
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close();
  });

  var showSuccess = function () {
    form.hidden = true;
    successEl.hidden = false;
  };

  var setBusy = function (busy) {
    submitBtn.disabled = busy;
    submitLabel.textContent = busy ? "Sending…" : "Send";
  };

  var mailtoFallback = function (payload) {
    var subject = encodeURIComponent(
      "Book a call - " + (payload.audience === "shop" ? "Rental shop" : "Advertiser")
    );
    var bodyLines = ["Name: " + payload.name, "Email: " + payload.email];
    if (payload.phone) bodyLines.push("Phone: " + payload.phone);
    if (payload.message) bodyLines.push("Message: " + payload.message);
    window.location.href =
      "mailto:" + FALLBACK_EMAIL + "?subject=" + subject + "&body=" + encodeURIComponent(bodyLines.join("\n"));
  };

  var submitToWeb3Forms = function (payload) {
    setBusy(true);
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: "Book a call - " + (payload.audience === "shop" ? "Rental shop" : "Advertiser"),
        from_name: payload.name + " (via pedalpanel.com)",
        audience: payload.audience,
        page: payload.page,
        name: payload.name,
        email: payload.email,
        phone: payload.phone || "(not provided)",
        message: payload.message || "(not provided)",
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || !data.success) throw new Error("Web3Forms error: " + (data.message || res.status));
        });
      })
      .finally(function () {
        setBusy(false);
      });
  };

  var submitToSupabase = function (payload) {
    setBusy(true);
    return fetch(SUPABASE_URL + "/rest/v1/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed: " + res.status);
      })
      .finally(function () {
        setBusy(false);
      });
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    // Honeypot: a hidden field real users never see or fill. If it has a
    // value, treat it as a bot and quietly "succeed" without submitting.
    if (form.hp.value) {
      showSuccess();
      return;
    }

    var payload = {
      audience: dialog.dataset.audience || "advertiser",
      page: window.location.pathname,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim() || null,
      message: form.message.value.trim() || null,
    };

    if (isWeb3FormsConfigured) {
      submitToWeb3Forms(payload)
        .then(showSuccess)
        .catch(function () {
          errorEl.textContent =
            "Something went wrong — mind emailing us directly at " + FALLBACK_EMAIL + "?";
          errorEl.hidden = false;
        });
    } else if (SUPABASE_ENABLED) {
      submitToSupabase(payload)
        .then(showSuccess)
        .catch(function () {
          errorEl.textContent =
            "Something went wrong — mind emailing us directly at " + FALLBACK_EMAIL + "?";
          errorEl.hidden = false;
        });
    } else {
      mailtoFallback(payload);
    }
  });
})();
