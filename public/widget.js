(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var chatbotId = script.getAttribute("data-chatbot-id");
  if (!chatbotId) {
    console.error("JAWAB Widget: data-chatbot-id is required");
    return;
  }

  var baseUrl = script.src.replace("/widget.js", "");
  var threadId = null;
  var visitorId = "v_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
  var config = null;
  var isOpen = false;
  var isRtl = false;

  // Detect Arabic text
  function isArabic(text) {
    var arabicRange = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRange.test(text);
  }

  // HTML escaping to prevent XSS
  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Validate color is a safe hex pattern
  function safeColor(color) {
    return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : "#059669";
  }

  // Create widget container
  var container = document.createElement("div");
  container.id = "jawab-widget";
  var shadow = container.attachShadow({ mode: "open" });

  // Styles
  var style = document.createElement("style");
  style.textContent = [
    "@import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&display=swap');",
    "* { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }",
    ".jawab-fab { position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 99999; transition: transform 0.2s, box-shadow 0.2s; }",
    ".jawab-fab:hover { transform: scale(1.05); box-shadow: 0 6px 24px rgba(0,0,0,0.2); }",
    ".jawab-fab svg { width: 28px; height: 28px; fill: white; }",
    ".jawab-panel { position: fixed; bottom: 96px; right: 24px; width: 380px; max-width: calc(100vw - 32px); height: 560px; max-height: calc(100vh - 120px); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.15); z-index: 99999; display: none; flex-direction: column; background: #fff; border: 1px solid #e5e7eb; }",
    ".jawab-panel.open { display: flex; animation: jawab-slide-up 0.3s ease; }",
    "@keyframes jawab-slide-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }",
    ".jawab-header { padding: 16px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f3f4f6; }",
    ".jawab-header-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }",
    ".jawab-header-icon svg { width: 20px; height: 20px; fill: white; }",
    ".jawab-header-info h3 { font-size: 15px; font-weight: 700; color: #111827; }",
    ".jawab-header-info p { font-size: 12px; color: #6b7280; }",
    ".jawab-close { margin-left: auto; background: none; border: none; cursor: pointer; padding: 4px; border-radius: 6px; color: #9ca3af; }",
    ".jawab-close:hover { background: #f3f4f6; color: #374151; }",
    ".jawab-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }",
    ".jawab-msg { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }",
    ".jawab-msg.bot { align-self: flex-start; background: #f3f4f6; color: #374151; border-bottom-left-radius: 4px; }",
    ".jawab-msg.user { align-self: flex-end; color: white; border-bottom-right-radius: 4px; }",
    ".jawab-msg.rtl { direction: rtl; text-align: right; font-family: 'Noto Kufi Arabic', sans-serif; }",
    ".jawab-msg.bot.rtl { border-bottom-left-radius: 14px; border-bottom-right-radius: 4px; }",
    ".jawab-msg.user.rtl { border-bottom-right-radius: 14px; border-bottom-left-radius: 4px; }",
    ".jawab-typing { display: flex; gap: 4px; padding: 12px 14px; align-self: flex-start; background: #f3f4f6; border-radius: 14px; border-bottom-left-radius: 4px; }",
    ".jawab-typing span { width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: jawab-bounce 1.4s infinite; }",
    ".jawab-typing span:nth-child(2) { animation-delay: 0.2s; }",
    ".jawab-typing span:nth-child(3) { animation-delay: 0.4s; }",
    "@keyframes jawab-bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }",
    ".jawab-input-area { padding: 12px 16px; border-top: 1px solid #f3f4f6; display: flex; gap: 8px; align-items: center; }",
    ".jawab-input-area input { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 0.2s; }",
    ".jawab-input-area input:focus { border-color: var(--primary); }",
    ".jawab-input-area input.rtl { direction: rtl; text-align: right; font-family: 'Noto Kufi Arabic', sans-serif; }",
    ".jawab-send { width: 38px; height: 38px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.2s; }",
    ".jawab-send:disabled { opacity: 0.5; cursor: not-allowed; }",
    ".jawab-send svg { width: 18px; height: 18px; fill: white; }",
    ".jawab-lead-form { padding: 16px; background: #f9fafb; border-top: 1px solid #f3f4f6; }",
    ".jawab-lead-form h4 { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }",
    ".jawab-lead-form input { width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; font-size: 13px; margin-bottom: 6px; outline: none; }",
    ".jawab-lead-form button { width: 100%; padding: 8px; border-radius: 8px; border: none; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }",
    ".jawab-powered { text-align: center; padding: 8px; font-size: 11px; color: #9ca3af; }",
    ".jawab-powered a { color: #6b7280; text-decoration: none; font-weight: 600; }",
  ].join("\n");
  shadow.appendChild(style);

  // Build widget HTML
  var wrapper = document.createElement("div");

  // FAB button
  var fab = document.createElement("button");
  fab.className = "jawab-fab";
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';

  // Chat panel
  var panel = document.createElement("div");
  panel.className = "jawab-panel";

  var messagesDiv = document.createElement("div");
  messagesDiv.className = "jawab-messages";

  var inputArea = document.createElement("div");
  inputArea.className = "jawab-input-area";

  var input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type a message...";

  var sendBtn = document.createElement("button");
  sendBtn.className = "jawab-send";
  sendBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  inputArea.appendChild(input);
  inputArea.appendChild(sendBtn);

  var powered = document.createElement("div");
  powered.className = "jawab-powered";
  powered.innerHTML = 'Powered by <a href="' + baseUrl + '" target="_blank">Jawab</a>';

  panel.appendChild(messagesDiv);
  panel.appendChild(inputArea);
  panel.appendChild(powered);

  wrapper.appendChild(fab);
  wrapper.appendChild(panel);
  shadow.appendChild(wrapper);
  document.body.appendChild(container);

  // Load config
  fetch(baseUrl + "/api/widget/" + chatbotId)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.chatbot) {
        config = data.chatbot;
        var color = safeColor(config.brandColor || "#059669");
        fab.style.background = color;
        sendBtn.style.background = color;
        style.textContent += "\n.jawab-msg.user { background: " + color + "; }";
        style.textContent += "\n.jawab-input-area input:focus { border-color: " + color + "; }";
        style.textContent += "\n:root { --primary: " + color + "; }";

        // Build header
        var header = document.createElement("div");
        header.className = "jawab-header";
        header.innerHTML = '<div class="jawab-header-icon" style="background:' + color + '"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>' +
          '<div class="jawab-header-info"><h3>' + escapeHtml(config.name || "Chat") + '</h3><p>Online</p></div>' +
          '<button class="jawab-close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';
        panel.insertBefore(header, messagesDiv);

        header.querySelector(".jawab-close").addEventListener("click", function () {
          isOpen = false;
          panel.classList.remove("open");
        });

        // Add welcome message
        if (config.welcomeMessage) {
          addMessage(config.welcomeMessage, "bot");
        }
      }
    })
    .catch(function (err) { console.error("JAWAB Widget: Failed to load config", err); });

  // Toggle chat
  fab.addEventListener("click", function () {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add("open");
      input.focus();
    } else {
      panel.classList.remove("open");
    }
  });

  // Send message
  function sendMessage() {
    var text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    // Show typing indicator
    var typing = document.createElement("div");
    typing.className = "jawab-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    messagesDiv.appendChild(typing);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    fetch(baseUrl + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatbotId: chatbotId,
        message: text,
        threadId: threadId,
        visitorId: visitorId,
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        typing.remove();
        if (data.message) {
          threadId = data.threadId;
          addMessage(data.message, "bot");

          // Check if response suggests lead capture
          var leadKeywords = ["whatsapp", "phone", "email", "contact", "number", "رقم", "واتساب", "تواصل"];
          var shouldCapture = leadKeywords.some(function (kw) {
            return data.message.toLowerCase().includes(kw);
          });
          if (shouldCapture) {
            showLeadForm();
          }
        } else {
          addMessage("Sorry, I could not process your request.", "bot");
        }
      })
      .catch(function () {
        typing.remove();
        addMessage("Connection error. Please try again.", "bot");
      });
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  // Auto-detect RTL on input
  input.addEventListener("input", function () {
    if (isArabic(input.value)) {
      input.classList.add("rtl");
    } else {
      input.classList.remove("rtl");
    }
  });

  function addMessage(text, sender) {
    var msg = document.createElement("div");
    msg.className = "jawab-msg " + sender;
    if (isArabic(text)) {
      msg.classList.add("rtl");
    }
    msg.textContent = text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showLeadForm() {
    // Only show once
    if (shadow.querySelector(".jawab-lead-form")) return;

    var form = document.createElement("div");
    form.className = "jawab-lead-form";
    var color = safeColor((config && config.brandColor) || "#059669");
    form.innerHTML = '<h4>Share your details for faster service</h4>' +
      '<input type="text" placeholder="Your name" id="jawab-lead-name" />' +
      '<input type="tel" placeholder="WhatsApp number" id="jawab-lead-whatsapp" />' +
      '<input type="email" placeholder="Email (optional)" id="jawab-lead-email" />' +
      '<button style="background:' + color + '">Submit</button>';

    panel.insertBefore(form, powered);

    form.querySelector("button").addEventListener("click", function () {
      var name = shadow.getElementById("jawab-lead-name").value;
      var whatsapp = shadow.getElementById("jawab-lead-whatsapp").value;
      var email = shadow.getElementById("jawab-lead-email").value;

      if (!whatsapp && !email) return;

      fetch(baseUrl + "/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbotId: chatbotId,
          threadId: threadId,
          name: name || null,
          whatsapp: whatsapp || null,
          email: email || null,
        }),
      }).then(function () {
        form.innerHTML = '<p style="text-align:center;color:#059669;font-size:13px;padding:8px;">Thank you! We\'ll be in touch.</p>';
        setTimeout(function () { form.remove(); }, 3000);
      });
    });
  }
})();
