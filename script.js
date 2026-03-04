const scriptURL = 'https://script.google.com/macros/s/AKfycbyI7epkmu6iA40X-AymuuYDPWuNXo9CHtjSmRFqXePthWq0g-bHTonazKJExyr1_Ie-/exec';

// Force the function to be global for CodePen's HTML to see it
window.postFeedback = postFeedback;

document.addEventListener("DOMContentLoaded", function() {
  console.log("App Ready");
  loadData();
});

function loadData() {
  const container = document.getElementById('forumPosts');
  const vCountDisplay = document.getElementById('vCount');

  fetch(scriptURL)
    .then(res => res.json())
    .then(data => {
      if (vCountDisplay) vCountDisplay.innerText = data.count || "0";
      if (container) {
        container.innerHTML = "";
        if (data.feedback && data.feedback.length > 0) {
          data.feedback.reverse().forEach(row => renderPost(row[0], row[1], row[2]));
        } else {
          container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No feedback shared yet.</p>';
        }
      }
    })
    .catch(err => console.error("Load Error:", err));
}

function postFeedback() {
  const nameInput = document.getElementById('userName');
  const feedbackInput = document.getElementById('feedbackInput');
  const btn = document.getElementById('submitBtn');

  if (!nameInput || !feedbackInput) {
    alert("Error: HTML elements not found!");
    return;
  }

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
    mode: 'no-cors', 
    body: payload 
  })
  .then(() => {
    // In CodePen, we refresh the UI manually since no-cors gives no feedback
    renderPost(nameVal, feedbackVal, "Just now");
    nameInput.value = "";
    feedbackInput.value = "";
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
    alert("Feedback shared successfully!");
  })
  .catch(err => {
    console.error("Post Error:", err);
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
  });
}

function renderPost(name, text, time) {
  const container = document.getElementById('forumPosts');
  if (!container) return;
  
  const post = document.createElement('div');
  post.className = 'feedback-entry';
  
  let displayTime = time;
  if (time !== "Just now" && time) {
    const d = new Date(time);
    displayTime = isNaN(d) ? time : d.toLocaleDateString();
  }

  post.innerHTML = `
    <div class="entry-header" style="font-weight:bold; display:flex; justify-content:space-between;">
      <span>👤 ${name}</span>
      <span style="font-size:0.8em; color:gray;">${displayTime}</span>
    </div>
    <div class="entry-text" style="margin-top:5px;">${text}</div>
  `;
  container.prepend(post);
}