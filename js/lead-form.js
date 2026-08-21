/**
 * Lead-capture dialog: "Book a call" opens this instead of a mailto:
 * link. On submit it inserts a row into Supabase (Postgres) via a
 * direct REST call — no SDK needed for a simple insert-only form, and
 * no custom backend server required beyond Supabase itself. Native
 * <dialog> (see css/base.css .lead-dialog) gives us focus handling,
 * Escape-to-close, and the ::backdrop for free.
 *
 * SETUP — replace the two placeholder constants below with your
 * Supabase project's URL and anon (public) key once you've created the
 * project and run the table/RLS SQL in README.md. Until they're set,
 * "Send" falls back to a pre-filled mailto so the CTA still works.
 */
(function () {
  var SUPABASE_URL = "https://xovsvcazxewmajvzgxqu.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_BB47OM2IZvH2vUk3VLO2GQ_IBNRb6du";
  var FALLBACK_EMAIL = "admin@pedalpanel.com";

  var isConfigured =
    SUPABASE_URL.indexOf("YOUR_SUPABASE") === -1 &&
    SUPABASE_ANON_KEY.indexOf("YOUR_SUPABASE") === -1;

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

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    // Honeypot: a hidden field real users never see or fill. If it has a
    // value, treat it as a bot and quietly "succeed" without submitting.
    if (form.hp.value) {
      form.hidden = true;
      successEl.hidden = false;
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

    if (!isConfigured) {
      // Supabase isn't wired up yet — fall back to a pre-filled mailto
      // so the CTA still works while setup is pending.
      var subject = encodeURIComponent(
        "Book a call - " + (payload.audience === "shop" ? "Rental shop" : "Advertiser")
      );
      var bodyLines = ["Name: " + payload.name, "Email: " + payload.email];
      if (payload.phone) bodyLines.push("Phone: " + payload.phone);
      if (payload.message) bodyLines.push("Message: " + payload.message);
      window.location.href =
        "mailto:" + FALLBACK_EMAIL + "?subject=" + subject + "&body=" + encodeURIComponent(bodyLines.join("\n"));
      return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Sending…";

    fetch(SUPABASE_URL + "/rest/v1/leads", {
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
        form.hidden = true;
        successEl.hidden = false;
      })
      .catch(function () {
        errorEl.textContent =
          "Something went wrong — mind emailing us directly at " + FALLBACK_EMAIL + "?";
        errorEl.hidden = false;
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitLabel.textContent = "Send";
      });
  });
})();
