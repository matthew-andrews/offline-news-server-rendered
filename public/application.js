(function() {
  var api = 'http' + (location.hostname === 'localhost' ? '://localhost:3000' : 's://offline-news-api.herokuapp.com') + '/stories';

  var ul, h1;

  main = document.querySelector('main');
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
    var ul = '';
    stories.forEach(function(story) {
      ul += '<li><a class="js-link" href="/'+story.guid+'">'+story.title+'</a></li>';
    });
    main.innerHTML = '<h1>FT Tech Blog</h1><ul>'+ul+'</ul>';
  }

  function renderOneStory(story) {
    if (!story) story = { title: '', body: '' };
    main.innerHTML = '<h1>'+story.title+'</h1>'+story.body;
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
