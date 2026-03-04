const scriptURL = 'https://script.google.com/macros/s/AKfycbyNoeagC-92LKWaibGy6kC-l6MG6NZ4MoJyLOa_5QiTORiBq0HhEQ3VJb1g9u4pN6h5/exec';

// Fetch existing posts
window.onload = function() {
  fetch(scriptURL)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('forumPosts');
      container.innerHTML = ""; 
      if(data.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999;">No feedback shared yet.</p>';
      } else {
        data.reverse().forEach(row => renderPost(row[0], row[1], row[2]));
      }
    });
};

function postFeedback() {
  const name = document.getElementById('userName').value.trim();
  const feedback = document.getElementById('feedbackInput').value.trim();
  const btn = document.getElementById('submitBtn');

  if(!name || !feedback) return alert("Please fill in both name and feedback.");

  btn.disabled = true;
  btn.innerText = "Posting...";

  fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ name: name, feedback: feedback })
  }).then(() => {
    renderPost(name, feedback, "Just now");
    document.getElementById('userName').value = "";
    document.getElementById('feedbackInput').value = "";
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
  }).catch(() => {
    alert("Error posting feedback.");
    btn.disabled = false;
  });
}

function renderPost(name, text, time) {
  const container = document.getElementById('forumPosts');
  const post = document.createElement('div');
  post.className = 'feedback-entry';
  const displayTime = time.toString().includes('T') ? new Date(time).toLocaleDateString() : time;

  post.innerHTML = `
    <div class="entry-header">
      <span class="entry-name">👤 ${name}</span>
      <span class="entry-date">${displayTime}</span>
    </div>
    <div class="entry-text">${text}</div>
  `;
  container.prepend(post);
}