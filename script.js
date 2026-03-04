const scriptURL = 'https://script.google.com/macros/s/AKfycbyI7epkmu6iA40X-AymuuYDPWuNXo9CHtjSmRFqXePthWq0g-bHTonazKJExyr1_Ie-/exec';

// 1. Force the function to be global so CodePen's HTML 'onclick' can find it
window.postFeedback = postFeedback;

document.addEventListener("DOMContentLoaded", () => {
  console.log("System Initialized");
  loadData();
});

/**
 * FETCHES VISITOR COUNT & SHARING POOL
 */
function loadData() {
  const container = document.getElementById('forumPosts');
  const vDisplay = document.getElementById('vCount');

  if (container) container.innerHTML = '<p style="text-align:center; color:#666;">Syncing pool...</p>';

  // Cache-busting: Adds a timestamp so Google sends FRESH data, not a saved 0
  fetch(`${scriptURL}?t=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
      console.log("Data Received:", data);

      // Update Visitor Count
      if (vDisplay) vDisplay.innerText = data.count || "1";

      // Update Sharing Pool
      if (container) {
        container.innerHTML = ""; 
        if (data.feedback && data.feedback.length > 0) {
          // Filter out empty rows and reverse (newest first)
          const validPosts = data.feedback.filter(row => row[0] && row[1]);
          validPosts.reverse().forEach(row => renderPost(row[0], row[1], row[2]));
        } else {
          container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">The pool is currently empty.</p>';
        }
      }
    })
    .catch(err => {
      console.error("Load Error:", err);
      if (container) container.innerHTML = '<p style="text-align:center; color:red;">Connection Error. Refresh page.</p>';
    });
}

/**
 * SENDS POST TO GOOGLE SHEETS
 */
function postFeedback() {
  const nameInput = document.getElementById('userName');
  const feedbackInput = document.getElementById('feedbackInput');
  const btn = document.getElementById('submitBtn');

  const nameVal = nameInput.value.trim();
  const feedbackVal = feedbackInput.value.trim();

  if (!nameVal || !feedbackVal) {
    alert("Please fill in both fields!");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Sharing...";

  const payload = JSON.stringify({ 
    name: nameVal, 
    feedback: feedbackVal 
  });

  fetch(scriptURL, { 
    method: 'POST', 
    mode: 'no-cors', // Essential for Google Apps Script
    body: payload 
  })
  .then(() => {
    alert("Shared successfully!");
    
    // Add to UI immediately (Optimistic Update)
    renderPost(nameVal, feedbackVal, "Just now");

    // Clear form
    nameInput.value = "";
    feedbackInput.value = "";
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";

    // Refresh data after 2 seconds to sync visitor count
    setTimeout(loadData, 2000);
  })
  .catch(err => {
    console.error("Post Error:", err);
    alert("Failed to share. Check your connection.");
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
  });
}

/**
 * CREATES THE POST HTML
 */
function renderPost(name, text, time) {
  const container = document.getElementById('forumPosts');
  if (!container) return;
  
  // Remove "empty" message if it exists
  const emptyMsg = container.querySelector('p');
  if (emptyMsg && emptyMsg.innerText.includes("empty")) emptyMsg.remove();

  const post = document.createElement('div');
  post.style = "background:#f9f9f9; border-left:4px solid #3498db; padding:15px; margin-bottom:15px; border-radius:4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align:left;";
  
  let displayTime = time;
  if (time !== "Just now" && time) {
    const d = new Date(time);
    displayTime = isNaN(d) ? time : d.toLocaleDateString();
  }

  post.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:5px;">
      <span style="font-weight:bold; color:#2c3e50;">👤 ${name}</span>
      <span style="font-size:0.8em; color:#95a5a6;">${displayTime}</span>
    </div>
    <div style="white-space:pre-wrap; font-size:0.95em; color:#34495e;">${text}</div>
  `;
  container.prepend(post);
}