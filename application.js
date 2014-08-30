(function() {
  var api = 'http' + (location.hostname === 'localhost' ? '://localhost:3000' : 's://offline-news-api.herokuapp.com') + '/stories';

  var ul, h1;

  ul = document.querySelector('ul');
  h1 = document.querySelector('h1');
  refreshView();
  document.body.addEventListener('click', onClick);
  window.addEventListener('popstate', refreshView);

  function onClick(e) {
    if (e.target.classList.contains('js-link')) {
      e.preventDefault();
      history.pushState({}, '', e.target.getAttribute('href'));
      refreshView();
    }
  }

  function refreshView() {
    var guid = (location.pathname+location.search).substring(1);
    if (guid === '') {
      renderAllStories();
      return serverStoriesGet().then(renderAllStories);
    }
    renderOneStory();
    return serverStoriesGet(guid).then(renderOneStory);
  }

  function renderAllStories(stories) {
    if (!stories) stories = [];
    var html = '';
    stories.forEach(function(story) {
      html += storyToHtml(story);
    });
    ul.innerHTML = html;
    h1.innerHTML = 'FT Tech News';
  }

  function renderOneStory(story) {
    if (!story) story = {};
    h1.innerHTML = story.title;
    ul.innerHTML = '<li>'+story.body+'</li>';
  }

  function storyToHtml(story) {
    return '<li><a class="js-link" href="/'+story.guid+'">'+story.title+'</a></li>';
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
