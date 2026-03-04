// 1. GLOBAL REGISTRATION - This fixes the "ReferenceError"
window.postFeedback = postFeedback;

const scriptURL = 'https://script.google.com/macros/s/AKfycbyI7epkmu6iA40X-AymuuYDPWuNXo9CHtjSmRFqXePthWq0g-bHTonazKJExyr1_Ie-/exec';

// 2. INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
  console.log("System Online. Syncing...");
  loadData();
});

function loadData() {
  const container = document.getElementById('forumPosts');
  const vDisplay = document.getElementById('vCount');

  fetch(`${scriptURL}?t=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
      if (vDisplay) vDisplay.innerText = data.count || "1";
      if (container && data.feedback) {
        container.innerHTML = "";
        [...data.feedback].reverse().forEach(row => {
          if(row[0]) renderPost(row[0], row[1], row[2]);
        });
      }
    })
    .catch(err => console.error("Load Error:", err));
}

// 3. THE POST FUNCTION
function postFeedback() {
  const nameBox = document.getElementById('userName');
  const feedBox = document.getElementById('feedbackInput');
  const btn = document.getElementById('submitBtn');

  const name = nameBox.value.trim();
  const feedback = feedBox.value.trim();

  if (!name || !feedback) {
    alert("Please enter both Name and Feedback!");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Sharing...";

  // Sending data to Google
  fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors', 
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, feedback: feedback })
  })
  .then(() => {
    alert("Shared successfully!");
    renderPost(name, feedback, "Just now");
    
    // Reset Form
    nameBox.value = "";
    feedBox.value = "";
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
    
    // Refresh database view after 3 seconds
    setTimeout(loadData, 3000);
  })
  .catch(err => {
    console.error("Post Error:", err);
    alert("Connection Error. Check your script URL.");
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
  });
}

function renderPost(name, text, time) {
  const container = document.getElementById('forumPosts');
  if (!container) return;
  
  const post = document.createElement('div');
  post.style = "background:white; border-left:5px solid #007bff; padding:15px; margin-bottom:10px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1); text-align:left;";
  
  let dTime = time;
  if (time && time !== "Just now") {
    const d = new Date(time);
    dTime = isNaN(d) ? time : d.toLocaleDateString();
  }

  post.innerHTML = `<strong>👤 ${name}</strong> <span style="float:right; color:gray; font-size:0.8em;">${dTime}</span><br><p style="margin-top:5px; color:#444;">${text}</p>`;
  container.prepend(post);
}