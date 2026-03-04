const scriptURL = 'https://script.google.com/macros/s/AKfycbyI7epkmu6iA40X-AymuuYDPWuNXo9CHtjSmRFqXePthWq0g-bHTonazKJExyr1_Ie-/exec';

// Force the function to be global so CodePen's HTML can find it
window.postFeedback = postFeedback;

document.addEventListener("DOMContentLoaded", () => {
  console.log("System Syncing...");
  loadData();
});

/**
 * 1. LOAD DATA (VISITS + ALL POSTS)
 */
function loadData() {
  const container = document.getElementById('forumPosts');
  const vDisplay = document.getElementById('vCount');

  if (container) {
    container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Fetching community pool...</p>';
  }

  // Adding a unique timestamp (?t=) forces Google to send FRESH data, not a cached 0
  fetch(`${scriptURL}?t=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
      console.log("Global Data Received:", data);

      // Update Visitor Count
      if (vDisplay) vDisplay.innerText = data.count || "1";

      // Update Sharing Pool
      if (container) {
        container.innerHTML = ""; 
        if (data.feedback && data.feedback.length > 0) {
          // Show newest posts at the top
          const validEntries = [...data.feedback].reverse();
          validEntries.forEach(row => renderPost(row[0], row[1], row[2]));
        } else {
          container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">The pool is currently empty. Be the first!</p>';
        }
      }
    })
    .catch(err => {
      console.error("Connection Error:", err);
      if (container) container.innerHTML = '<p style="text-align:center; color:red;">Sync error. Please refresh.</p>';
    });
}

/**
 * 2. POST FEEDBACK
 */
function postFeedback() {
  const nameInput = document.getElementById('userName');
  const feedInput = document.getElementById('feedbackInput');
  const btn = document.getElementById('submitBtn');

  const nameVal = nameInput.value.trim();
  const feedVal = feedInput.value.trim();

  if (!nameVal || !feedVal) {
    alert("Please fill in both fields!");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Sharing to Pool...";

  fetch(scriptURL, { 
    method: 'POST', 
    mode: 'no-cors', // Essential for Google Apps Script
    body: JSON.stringify({ name: nameVal, feedback: feedVal }) 
  })
  .then(() => {
    alert("Successfully shared with the community!");
    
    // Add to UI immediately
    renderPost(nameVal, feedVal, "Just now");
    
    // Reset Form
    nameInput.value = "";
    feedInput.value = "";
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
    
    // Full sync after 2 seconds to update visitor count
    setTimeout(loadData, 2000);
  })
  .catch(err => {
    console.error("Post Error:", err);
    alert("Error sharing. Check your connection.");
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
  });
}

/**
 * 3. RENDER POST HTML
 */
function renderPost(name, text, time) {
  const container = document.getElementById('forumPosts');
  if (!container) return;
  
  // Remove empty message if it exists
  const emptyMsg = container.querySelector('p');
  if (emptyMsg && emptyMsg.innerText.includes("empty")) emptyMsg.remove();

  const post = document.createElement('div');
  post.style = "background:#fff; border:1px solid #eee; border-left:5px solid #3498db; padding:15px; margin-bottom:12px; border-radius:6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align:left;";
  
  let dTime = time;
  if (time !== "Just now" && time) {
    const d = new Date(time);
    dTime = isNaN(d) ? time : d.toLocaleDateString();
  }

  post.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid #f4f4f4; padding-bottom:5px;">
      <span style="font-weight:bold; color:#2c3e50;">👤 ${name}</span>
      <span style="font-size:0.85em; color:#95a5a6;">${dTime}</span>
    </div>
    <div style="white-space:pre-wrap; font-size:0.95em; line-height:1.4; color:#34495e;">${text}</div>
  `;
  container.prepend(post);
}