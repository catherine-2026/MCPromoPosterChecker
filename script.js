function postFeedback() {
  const nameBox = document.getElementById('userName');
  const feedbackBox = document.getElementById('feedbackText');
  const forum = document.getElementById('forumPosts');

  if (nameBox.value.trim() === "" || feedbackBox.value.trim() === "") {
    alert("Please enter both your name and the feedback!");
    return;
  }

  // Remove empty message
  const emptyMsg = document.querySelector('.empty-msg');
  if (emptyMsg) emptyMsg.remove();

  // Create Post
  const post = document.createElement('div');
  post.className = 'feedback-entry';
  
  const now = new Date();
  const timestamp = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  post.innerHTML = `
    <div class="entry-header">
      <span class="entry-name">👤 ${nameBox.value}</span>
      <span class="entry-date">${timestamp}</span>
    </div>
    <div class="entry-text">${feedbackBox.value}</div>
  `;

  // Add to top of forum
  forum.prepend(post);

  // Clear inputs
  nameBox.value = "";
  feedbackBox.value = "";
  
  alert("Post successful! Thank you for sharing.");
}