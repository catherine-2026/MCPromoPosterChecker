const scriptURL = 'https://script.google.com/macros/s/AKfycbyI7epkmu6iA40X-AymuuYDPWuNXo9CHtjSmRFqXePthWq0g-bHTonazKJExyr1_Ie-/exec';

window.postFeedback = postFeedback;

document.addEventListener("DOMContentLoaded", () => loadData());

function loadData() {
  const container = document.getElementById('forumPosts');
  const vDisplay = document.getElementById('vCount');

  // cache-busting ensures fresh data
  fetch(`${scriptURL}?t=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
      if (vDisplay) vDisplay.innerText = data.count || "1";

      // SAFETY GUARD: Only refresh the pool if Google actually sends posts back
      if (data.feedback && data.feedback.length > 0) {
        container.innerHTML = ""; // Clear only now because we have data to show
        [...data.feedback].reverse().forEach(row => renderPost(row[0], row[1], row[2]));
      } else {
        console.log("Google returned 0 posts. Keeping current screen as is.");
      }
    })
    .catch(err => console.error("Sync Error:", err));
}

function postFeedback() {
  const nameInput = document.getElementById('userName');
  const feedInput = document.getElementById('feedbackInput');
  const btn = document.getElementById('submitBtn');

  const nameVal = nameInput.value.trim();
  const feedVal = feedInput.value.trim();

  if (!nameVal || !feedVal) return alert("Fill both fields!");

  btn.disabled = true;
  btn.innerText = "Saving...";

  // 1. POST to Google
  fetch(scriptURL, { 
    method: 'POST', 
    mode: 'no-cors', 
    body: JSON.stringify({ name: nameVal, feedback: feedVal }) 
  })
  .then(() => {
    // 2. SHOW LOCAL COPY (This stays on screen)
    renderPost(nameVal, feedVal, "Just now");
    
    // 3. CLEAN UP
    nameInput.value = "";
    feedInput.value = "";
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
    
    // 4. DELAYED SYNC (Wait 4 seconds for Google to finish writing)
    setTimeout(loadData, 4000);
  });
}

function renderPost(name, text, time) {
  const container = document.getElementById('forumPosts');
  if (!container) return;

  // Remove "No records" or "Syncing" text if it exists
  const status = container.querySelector('p');
  if (status) status.remove();

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
    <div style="white-space:pre-wrap; font-size:0.95em; color:#555; line-height:1.4;">${text}</div>
  `;
  container.prepend(post);
}