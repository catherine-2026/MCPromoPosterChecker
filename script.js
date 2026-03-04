const scriptURL = 'https://script.google.com/macros/s/AKfycbyI7epkmu6iA40X-AymuuYDPWuNXo9CHtjSmRFqXePthWq0g-bHTonazKJExyr1_Ie-/exec';

// Globalize for CodePen's HTML
window.postFeedback = postFeedback;

document.addEventListener("DOMContentLoaded", () => {
  console.log("MC Auditor: Initializing Live Sync...");
  loadData();
});

/**
 * FETCHES LATEST RECORDS
 */
function loadData() {
  const container = document.getElementById('forumPosts');
  const vDisplay = document.getElementById('vCount');

  if (container) container.innerHTML = '<p style="text-align:center; color:#888;">Updating pool from Google Sheets...</p>';

  // Cache-busting: 't=' and 'cache: no-store' forces Google to bypass the 0 count
  fetch(`${scriptURL}?t=${Date.now()}`, { 
    method: 'GET',
    cache: 'no-store' 
  })
    .then(res => res.json())
    .then(data => {
      console.log("Records Found:", data.feedback ? data.feedback.length : 0);
      
      if (vDisplay) vDisplay.innerText = data.count || "1";

      if (container) {
        container.innerHTML = ""; 
        if (data.feedback && data.feedback.length > 0) {
          // Filter rows that have at least a Name (Index 0) and Feedback (Index 1)
          const activePosts = data.feedback.filter(row => row[0] && row[1]);
          
          activePosts.reverse().forEach(row => renderPost(row[0], row[1], row[2]));
        } else {
          container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">The database is connected but no posts were found.</p>';
        }
      }
    })
    .catch(err => {
      console.error("Fetch Error:", err);
      if (container) container.innerHTML = '<p style="text-align:center; color:red;">Sync Error. Please check your Script URL.</p>';
    });
}

/**
 * SUBMITS NEW RECORD
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
  btn.innerText = "Writing to Sheet...";

  fetch(scriptURL, { 
    method: 'POST', 
    mode: 'no-cors', 
    body: JSON.stringify({ name: nameInput.value.trim(), feedback: feedInput.value.trim() }) 
  })
  .then(() => {
    alert("Record updated in Google Sheet!");
    
    // Optimistic UI Update: Show the post immediately
    renderPost(nameInput.value, feedInput.value, "Just now");
    
    nameInput.value = "";
    feedInput.value = "";
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
    
    // Refresh the whole pool after 2.5 seconds to sync
    setTimeout(loadData, 2500);
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
  
  const emptyMsg = container.querySelector('p');
  if (emptyMsg && emptyMsg.innerText.includes("no posts")) emptyMsg.remove();

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