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

  // Format timestamp
  function formatTime() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" : "") + m + " " + ampm;
  }

  // Lighten a hex color for gradients
  function lightenColor(hex, percent) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    r = Math.min(255, Math.round(r + (255 - r) * percent));
    g = Math.min(255, Math.round(g + (255 - g) * percent));
    b = Math.min(255, Math.round(b + (255 - b) * percent));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

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

  // Premium Styles
  var style = document.createElement("style");
  style.textContent = [
    "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap');",
    "* { margin: 0; padding: 0; box-sizing: border-box; }",
    ":host { --primary: #059669; --primary-light: #d1fae5; --text: #1f2937; --text-muted: #6b7280; --text-light: #9ca3af; --bg: #ffffff; --bg-subtle: #f9fafb; --border: #e5e7eb; --border-light: #f3f4f6; --shadow-sm: 0 1px 3px rgba(0,0,0,0.08); --shadow-lg: 0 12px 48px rgba(0,0,0,0.16); --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; --font-ar: 'Noto Kufi Arabic', 'Inter', sans-serif; }",
    ".jawab-fab { position: fixed; bottom: 24px; right: 24px; height: 56px; padding: 0 20px 0 16px; border-radius: 28px; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow-lg); z-index: 99999; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); font-family: var(--font); font-size: 14px; font-weight: 600; color: white; }",
    ".jawab-fab:hover { transform: translateY(-2px); box-shadow: 0 16px 56px rgba(0,0,0,0.22); }",
    ".jawab-fab .fab-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }",
    ".jawab-fab .fab-icon svg { width: 22px; height: 22px; fill: white; }",
    ".jawab-fab .fab-pulse { position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background: #22c55e; border: 2px solid white; border-radius: 50%; }",
    ".jawab-panel { position: fixed; bottom: 92px; right: 24px; width: 400px; max-width: calc(100vw - 32px); height: 600px; max-height: calc(100vh - 120px); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-lg); z-index: 99999; display: none; flex-direction: column; background: var(--bg); border: 1px solid var(--border); }",
    ".jawab-panel.open { display: flex; animation: jawab-enter 0.35s cubic-bezier(0.4,0,0.2,1); }",
    "@keyframes jawab-enter { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }",
    ".jawab-header { padding: 0; display: flex; flex-direction: column; flex-shrink: 0; }",
    ".jawab-header-main { padding: 16px 20px 12px; display: flex; align-items: center; gap: 12px; }",
    ".jawab-header-avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(255,255,255,0.15); overflow: hidden; }",
    ".jawab-header-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }",
    ".jawab-header-avatar svg { width: 22px; height: 22px; fill: white; }",
    ".jawab-header-info { flex: 1; min-width: 0; }",
    ".jawab-header-info h3 { font-family: var(--font); font-size: 15px; font-weight: 700; color: white; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".jawab-header-status { display: flex; align-items: center; gap: 5px; margin-top: 2px; }",
    ".jawab-header-status .dot { width: 7px; height: 7px; background: #22c55e; border-radius: 50%; flex-shrink: 0; }",
    ".jawab-header-status span { font-family: var(--font); font-size: 12px; color: rgba(255,255,255,0.75); font-weight: 500; }",
    ".jawab-close { background: rgba(255,255,255,0.1); border: none; cursor: pointer; padding: 8px; border-radius: 10px; color: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }",
    ".jawab-close:hover { background: rgba(255,255,255,0.2); color: white; }",
    ".jawab-banner { padding: 10px 20px 12px; display: flex; align-items: center; gap: 10px; border-top: 1px solid rgba(255,255,255,0.1); }",
    ".jawab-banner-icon { font-size: 16px; flex-shrink: 0; }",
    ".jawab-banner-text { font-family: var(--font); font-size: 12px; color: rgba(255,255,255,0.9); line-height: 1.4; font-weight: 500; }",
    ".jawab-messages { flex: 1; overflow-y: auto; padding: 16px 16px 8px; display: flex; flex-direction: column; gap: 4px; background: var(--bg-subtle); scrollbar-width: thin; scrollbar-color: var(--border) transparent; }",
    ".jawab-messages::-webkit-scrollbar { width: 5px; }",
    ".jawab-messages::-webkit-scrollbar-track { background: transparent; }",
    ".jawab-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }",
    ".jawab-msg-group { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }",
    ".jawab-msg-group.user { align-items: flex-end; }",
    ".jawab-msg-group.bot { align-items: flex-start; }",
    ".jawab-msg-sender { font-family: var(--font); font-size: 11px; font-weight: 600; color: var(--text-muted); padding: 0 4px; margin-bottom: 2px; }",
    ".jawab-msg-sender.user { text-align: right; }",
    ".jawab-msg { max-width: 82%; padding: 10px 14px; font-family: var(--font); font-size: 14px; line-height: 1.55; word-wrap: break-word; }",
    ".jawab-msg.bot { background: var(--bg); color: var(--text); border-radius: 4px 14px 14px 14px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-light); }",
    ".jawab-msg.user { color: white; border-radius: 14px 14px 4px 14px; }",
    ".jawab-msg.rtl { direction: rtl; text-align: right; font-family: var(--font-ar); }",
    ".jawab-msg.bot.rtl { border-radius: 14px 4px 14px 14px; }",
    ".jawab-msg.user.rtl { border-radius: 14px 14px 14px 4px; }",
    ".jawab-msg-time { font-family: var(--font); font-size: 10px; color: var(--text-light); padding: 2px 4px 0; }",
    ".jawab-msg-group.user .jawab-msg-time { text-align: right; }",
    ".jawab-typing-group { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; margin-bottom: 8px; }",
    ".jawab-typing { display: flex; gap: 5px; padding: 12px 16px; background: var(--bg); border-radius: 4px 14px 14px 14px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-light); }",
    ".jawab-typing span { width: 7px; height: 7px; background: var(--text-light); border-radius: 50%; animation: jawab-bounce 1.4s infinite; }",
    ".jawab-typing span:nth-child(2) { animation-delay: 0.2s; }",
    ".jawab-typing span:nth-child(3) { animation-delay: 0.4s; }",
    "@keyframes jawab-bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }",
    ".jawab-quick-actions { padding: 8px 16px 4px; display: flex; flex-wrap: wrap; gap: 6px; background: var(--bg-subtle); }",
    ".jawab-quick-btn { font-family: var(--font); font-size: 12px; font-weight: 500; padding: 7px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg); color: var(--text); cursor: pointer; transition: all 0.2s; white-space: nowrap; }",
    ".jawab-quick-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }",
    ".jawab-input-area { padding: 12px 16px; border-top: 1px solid var(--border-light); display: flex; gap: 8px; align-items: center; background: var(--bg); }",
    ".jawab-input-wrap { flex: 1; display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: 12px; padding: 0 4px 0 14px; transition: border-color 0.2s, box-shadow 0.2s; background: var(--bg); }",
    ".jawab-input-wrap:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(5,150,105,0.1); }",
    ".jawab-input-wrap input { flex: 1; border: none; padding: 10px 0; font-family: var(--font); font-size: 14px; outline: none; background: transparent; color: var(--text); }",
    ".jawab-input-wrap input::placeholder { color: var(--text-light); }",
    ".jawab-input-wrap input.rtl { direction: rtl; text-align: right; font-family: var(--font-ar); }",
    ".jawab-send { width: 36px; height: 36px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }",
    ".jawab-send:disabled { opacity: 0.4; cursor: not-allowed; }",
    ".jawab-send:not(:disabled):hover { transform: scale(1.05); }",
    ".jawab-send svg { width: 16px; height: 16px; fill: white; }",
    ".jawab-lead-form { padding: 16px; background: var(--bg); border-top: 1px solid var(--border-light); }",
    ".jawab-lead-form h4 { font-family: var(--font); font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }",
    ".jawab-lead-form input { width: 100%; border: 1.5px solid var(--border); border-radius: 10px; padding: 9px 12px; font-family: var(--font); font-size: 13px; margin-bottom: 6px; outline: none; transition: border-color 0.2s; background: var(--bg); color: var(--text); }",
    ".jawab-lead-form input:focus { border-color: var(--primary); }",
    ".jawab-lead-form button { width: 100%; padding: 10px; border-radius: 10px; border: none; color: white; font-family: var(--font); font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; margin-top: 4px; }",
    ".jawab-lead-form button:hover { opacity: 0.9; }",
    ".jawab-powered { text-align: center; padding: 8px; font-family: var(--font); font-size: 10px; color: var(--text-light); background: var(--bg); letter-spacing: 0.3px; }",
    ".jawab-powered a { color: var(--text-muted); text-decoration: none; font-weight: 700; }",
    ".jawab-powered a:hover { color: var(--primary); }",
    "@media (max-width: 480px) { .jawab-panel { bottom: 0; right: 0; left: 0; width: 100%; max-width: 100%; height: 100vh; max-height: 100vh; border-radius: 0; } .jawab-fab { bottom: 16px; right: 16px; } }",
  ].join("\n");
  shadow.appendChild(style);

  // Build widget HTML
  var wrapper = document.createElement("div");

  // FAB button (pill shape with label)
  var fab = document.createElement("button");
  fab.className = "jawab-fab";
  fab.innerHTML = '<span class="fab-icon"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg></span><span class="fab-label">Chat with us</span><span class="fab-pulse"></span>';

  // Chat panel
  var panel = document.createElement("div");
  panel.className = "jawab-panel";

  var messagesDiv = document.createElement("div");
  messagesDiv.className = "jawab-messages";

  var quickActions = document.createElement("div");
  quickActions.className = "jawab-quick-actions";

  var inputArea = document.createElement("div");
  inputArea.className = "jawab-input-area";

  var inputWrap = document.createElement("div");
  inputWrap.className = "jawab-input-wrap";

  var input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type your message...";

  var sendBtn = document.createElement("button");
  sendBtn.className = "jawab-send";
  sendBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  inputWrap.appendChild(input);
  inputWrap.appendChild(sendBtn);
  inputArea.appendChild(inputWrap);

  var powered = document.createElement("div");
  powered.className = "jawab-powered";
  powered.innerHTML = 'Powered by <a href="' + baseUrl + '" target="_blank" rel="noopener noreferrer">JAWAB</a>';

  panel.appendChild(messagesDiv);
  panel.appendChild(quickActions);
  panel.appendChild(inputArea);
  panel.appendChild(powered);

  wrapper.appendChild(fab);
  wrapper.appendChild(panel);
  shadow.appendChild(wrapper);
  document.body.appendChild(container);

  // Apply brand color to all elements
  function applyBrandColor(color) {
    var light = lightenColor(color, 0.9);
    style.textContent += "\n:host { --primary: " + color + "; --primary-light: " + light + "; }";
    fab.style.background = "linear-gradient(135deg, " + color + " 0%, " + lightenColor(color, 0.15) + " 100%)";
    sendBtn.style.background = color;
    style.textContent += "\n.jawab-msg.user { background: linear-gradient(135deg, " + color + " 0%, " + lightenColor(color, 0.15) + " 100%); }";
    style.textContent += "\n.jawab-quick-btn:hover { border-color: " + color + "; color: " + color + "; background: " + light + "; }";
  }

  // Load config
  fetch(baseUrl + "/api/widget/" + chatbotId)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.chatbot) {
        config = data.chatbot;
        var color = safeColor(config.brandColor || "#059669");
        applyBrandColor(color);

        // Build premium header with gradient
        var header = document.createElement("div");
        header.className = "jawab-header";
        header.style.background = "linear-gradient(135deg, " + color + " 0%, " + lightenColor(color, 0.2) + " 100%)";

        var headerMain = document.createElement("div");
        headerMain.className = "jawab-header-main";

        // Build avatar using safe DOM APIs (no innerHTML for user-controlled values)
        var avatarDiv = document.createElement("div");
        avatarDiv.className = "jawab-header-avatar";
        if (config.logoUrl) {
          var avatarImg = document.createElement("img");
          avatarImg.src = config.logoUrl;
          avatarImg.alt = config.botName || config.name || "";
          avatarDiv.appendChild(avatarImg);
        } else {
          avatarDiv.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
        }

        // Build header info using safe DOM APIs
        var headerInfo = document.createElement("div");
        headerInfo.className = "jawab-header-info";
        var headerTitle = document.createElement("h3");
        headerTitle.textContent = config.botName || config.name || "Chat";
        var headerStatus = document.createElement("div");
        headerStatus.className = "jawab-header-status";
        headerStatus.innerHTML = '<span class="dot"></span><span>Online now</span>';
        headerInfo.appendChild(headerTitle);
        headerInfo.appendChild(headerStatus);

        // Build close button (no user-controlled values)
        var closeBtn = document.createElement("button");
        closeBtn.className = "jawab-close";
        closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

        headerMain.appendChild(avatarDiv);
        headerMain.appendChild(headerInfo);
        headerMain.appendChild(closeBtn);

        header.appendChild(headerMain);

        // Banner area for offers/promo
        if (config.description) {
          var banner = document.createElement("div");
          banner.className = "jawab-banner";
          banner.innerHTML = '<span class="jawab-banner-icon">\u2728</span><span class="jawab-banner-text">' + escapeHtml(config.description) + '</span>';
          header.appendChild(banner);
        }

        panel.insertBefore(header, messagesDiv);

        closeBtn.addEventListener("click", function () {
          isOpen = false;
          panel.classList.remove("open");
        });

        // Update FAB label with bot name
        var fabLabel = fab.querySelector(".fab-label");
        if (fabLabel && config.botName && config.botName !== "Jawab") {
          fabLabel.textContent = "Chat with " + config.botName;
        }

        // Quick action buttons
        var defaultActions = [
          { text: "\uD83D\uDCC5 Book Appointment", msg: "I would like to book an appointment, please tell me about the available times and what to expect" },
          { text: "\uD83D\uDCB0 View Pricing", msg: "What are your prices and packages?" },
          { text: "\u2753 Ask a Question", msg: "I have a question about your services" },
        ];
        defaultActions.forEach(function(action) {
          var btn = document.createElement("button");
          btn.className = "jawab-quick-btn";
          btn.textContent = action.text;
          btn.addEventListener("click", function() {
            input.value = action.msg;
            sendMessage();
            quickActions.style.display = "none";
          });
          quickActions.appendChild(btn);
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
    input.classList.remove("rtl");

    quickActions.style.display = "none";

    // Show typing indicator with sender label
    var typingGroup = document.createElement("div");
    typingGroup.className = "jawab-typing-group";
    var typingSender = document.createElement("div");
    typingSender.className = "jawab-msg-sender";
    typingSender.textContent = (config && config.botName) || "Jawab";
    var typing = document.createElement("div");
    typing.className = "jawab-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    typingGroup.appendChild(typingSender);
    typingGroup.appendChild(typing);
    messagesDiv.appendChild(typingGroup);
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
        typingGroup.remove();
        if (data.message) {
          threadId = data.threadId;
          addMessage(data.message, "bot");

          // Check if response suggests lead capture
          var leadKeywords = ["whatsapp", "phone", "email", "contact", "number", "book", "appointment", "schedule", "\u0631\u0642\u0645", "\u0648\u0627\u062A\u0633\u0627\u0628", "\u062A\u0648\u0627\u0635\u0644", "\u062D\u062C\u0632"];
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
        typingGroup.remove();
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
    var group = document.createElement("div");
    group.className = "jawab-msg-group " + sender;

    var senderLabel = document.createElement("div");
    senderLabel.className = "jawab-msg-sender " + sender;
    if (sender === "bot") {
      senderLabel.textContent = (config && config.botName) || "Jawab";
    } else {
      senderLabel.textContent = "You";
    }

    var msg = document.createElement("div");
    msg.className = "jawab-msg " + sender;
    if (isArabic(text)) {
      msg.classList.add("rtl");
    }
    msg.textContent = text;

    var time = document.createElement("div");
    time.className = "jawab-msg-time";
    time.textContent = formatTime();

    group.appendChild(senderLabel);
    group.appendChild(msg);
    group.appendChild(time);
    messagesDiv.appendChild(group);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showLeadForm() {
    // Only show once
    if (shadow.querySelector(".jawab-lead-form")) return;

    var form = document.createElement("div");
    form.className = "jawab-lead-form";
    var color = safeColor((config && config.brandColor) || "#059669");
    form.innerHTML = '<h4>\uD83D\uDCCB Share your details for faster service</h4>' +
      '<input type="text" placeholder="Your name" id="jawab-lead-name" />' +
      '<input type="tel" placeholder="WhatsApp number" id="jawab-lead-whatsapp" />' +
      '<input type="email" placeholder="Email (optional)" id="jawab-lead-email" />' +
      '<button style="background: linear-gradient(135deg, ' + color + ' 0%, ' + lightenColor(color, 0.15) + ' 100%)">Get in Touch</button>';

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
        form.innerHTML = '<p style="text-align:center;color:#059669;font-family:var(--font);font-size:13px;padding:12px;font-weight:600;">\u2728 Thank you! We will be in touch shortly.</p>';
        setTimeout(function () { form.remove(); }, 3000);
      });
    });
  }
})();
