const scriptURL = 'https://script.google.com/macros/s/AKfycbyI7epkmu6iA40X-AymuuYDPWuNXo9CHtjSmRFqXePthWq0g-bHTonazKJExyr1_Ie-/exec';

window.postFeedback = postFeedback;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Syncing Pool...");
  loadData();
});

function loadData() {
  const container = document.getElementById('forumPosts');
  const vDisplay = document.getElementById('vCount');

  // We don't clear the container if there are already posts showing
  if (container && container.children.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#888;">Updating pool...</p>';
  }

  fetch(`${scriptURL}?nocache=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
      if (vDisplay) vDisplay.innerText = data.count || "1";

      if (container) {
        // Only clear and rebuild if we actually received data
        if (data.feedback && data.feedback.length > 0) {
          container.innerHTML = ""; 
          const entries = [...data.feedback].reverse();
          entries.forEach(row => renderPost(row[0], row[1], row[2]));
        } else if (container.children.length === 0) {
          // Only show empty message if there are TRULY no posts
          container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No records found in database.</p>';
        }
      }
    })
    .catch(err => console.error("Sync Error:", err));
}

function postFeedback() {
  const nameInput = document.getElementById('userName');
  const feedInput = document.getElementById('feedbackInput');
  const btn = document.getElementById('submitBtn');

  if (!nameInput.value.trim() || !feedInput.value.trim()) return alert("Fill both fields!");

  const nameVal = nameInput.value.trim();
  const feedVal = feedInput.value.trim();

  btn.disabled = true;
  btn.innerText = "Saving...";

  // 1. Show it IMMEDIATELY (Optimistic UI)
  renderPost(nameVal, feedVal, "Just now");

  // 2. Send to Google
  fetch(scriptURL, { 
    method: 'POST', 
    mode: 'no-cors', 
    body: JSON.stringify({ name: nameVal, feedback: feedVal }) 
  })
  .then(() => {
    nameInput.value = "";
    feedInput.value = "";
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
    
    // 3. WAIT 5 SECONDS before refreshing
    // Google needs time to process the new row before we "Read" again
    setTimeout(loadData, 5000);
  });
}

function renderPost(name, text, time) {
  const container = document.getElementById('forumPosts');
  if (!container) return;
  
  // Clean up any "Updating" or "No records" text
  const statusMsg = container.querySelector('p');
  if (statusMsg) statusMsg.remove();

  const post = document.createElement('div');
  post.style = "background:#fff; border-left:5px solid #007bff; padding:15px; margin-bottom:12px; border-radius:6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align:left;";
  
  let dTime = time;
  if (time !== "Just now" && time) {
    const d = new Date(time);
    dTime = isNaN(d) ? time : d.toLocaleDateString();
  }

  post.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid #f4f4f4; padding-bottom:5px;">
      <span style="font-weight:bold; color:#333;">👤 ${name}</span>
      <span style="font-size:0.85em; color:#999;">${dTime}</span>
    </div>
    <div style="white-space:pre-wrap; font-size:0.95em; color:#555;">${text}</div>
  `;
  container.prepend(post);
}