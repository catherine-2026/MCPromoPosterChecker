const scriptURL = 'https://script.google.com/macros/s/AKfycbyI7epkmu6iA40X-AymuuYDPWuNXo9CHtjSmRFqXePthWq0g-bHTonazKJExyr1_Ie-/exec';

// Force the function to be global for CodePen
window.postFeedback = postFeedback;

document.addEventListener("DOMContentLoaded", () => {
  console.log("App Initialized - Syncing Pool...");
  loadData();
});

/**
 * FETCH DATA FROM GOOGLE
 */
function loadData() {
  const container = document.getElementById('forumPosts');
  const vDisplay = document.getElementById('vCount');

  if (container) {
    container.innerHTML = '<p style="text-align:center; color:#888;">Updating pool from Google Sheets...</p>';
  }

  // Use a unique timestamp to force the browser to get the NEW data you saw in your browser tab
  fetch(`${scriptURL}?nocache=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
      console.log("Live Sync Successful:", data);

      // Update Visitor Count
      if (vDisplay) vDisplay.innerText = data.count || "1";

      // Update Sharing Pool
      if (container) {
        container.innerHTML = ""; 
        
        if (data.feedback && data.feedback.length > 0) {
          // Reverse to show newest at the top
          const entries = [...data.feedback].reverse();
          entries.forEach(row => renderPost(row[0], row[1], row[2]));
        } else {
          container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Connected! But no rows were detected in the sheet.</p>';
        }
      }
    })
    .catch(err => {
      console.error("Sync Error:", err);
      if (container) container.innerHTML = '<p style="text-align:center; color:red;">Sync Error. Please refresh.</p>';
    });
}

/**
 * POST NEW FEEDBACK
 */
function postFeedback() {
  const nameInput = document.getElementById('userName');
  const feedInput = document.getElementById('feedbackInput');
  const btn = document.getElementById('submitBtn');

  if (!nameInput.value.trim() || !feedInput.value.trim()) {
    alert("Please fill in both fields!");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Saving...";

  fetch(scriptURL, { 
    method: 'POST', 
    mode: 'no-cors', 
    body: JSON.stringify({ name: nameInput.value.trim(), feedback: feedInput.value.trim() }) 
  })
  .then(() => {
    // Show success
    renderPost(nameInput.value, feedInput.value, "Just now");
    
    // Clear & Reset
    nameInput.value = "";
    feedInput.value = "";
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
    
    alert("Record updated successfully!");
    
    // Refresh the pool after 2 seconds to sync visitor count
    setTimeout(loadData, 2000);
  })
  .catch(err => {
    console.error("Post Error:", err);
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
  });
}

/**
 * UI RENDERER
 */
function renderPost(name, text, time) {
  const container = document.getElementById('forumPosts');
  if (!container) return;
  
  // Remove "no rows" message if present
  const emptyMsg = container.querySelector('p');
  if (emptyMsg && emptyMsg.innerText.includes("Connected")) emptyMsg.remove();

  const post = document.createElement('div');
  post.style = "background:#fff; border:1px solid #eee; border-left:5px solid #007bff; padding:15px; margin-bottom:12px; border-radius:6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align:left;";
  
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