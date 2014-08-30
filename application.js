(function() {
  var api = 'http' + (location.hostname === 'localhost' ? '://localhost:3000' : 's://offline-news-api.herokuapp.com') + '/stories';

  var ul;

  ul = document.querySelector('ul');
  refreshView();
  document.body.addEventListener('click', onClick);

  function onClick(e) {
    e.preventDefault();
    if (e.target.tagName.toLowerCase() === 'a') {
      history.pushState({}, '', e.target.getAttribute('href'));
    }
  }

  function refreshView() {
    return serverStoriesGet().then(renderAllStories);
  }

  function renderAllStories(stories) {
    var html = '';
    stories.forEach(function(story) {
      html += storyToHtml(story);
    });
    ul.innerHTML = html;
  }

  function storyToHtml(story) {
    return '<li><a href="/'+story.guid+'">'+story.title+'</a></li>';
  }

  function serverStoriesGet(_id) {
    return new Promise(function(resolve, reject) {
      superagent.get(api+'/' + (_id ? _id : ''))
        .end(function(err, res) {
          if (!err && res.ok) resolve(res.body);
          else reject(res);
        });
    });
  }
})();
