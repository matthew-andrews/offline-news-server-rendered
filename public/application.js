(function() {
  var api = 'http' + (location.hostname === 'localhost' ? '://localhost:3000' : 's://offline-news-api.herokuapp.com') + '/stories';

  var ul, h1;

  databaseOpen()
    .then(function() {
      main = document.querySelector('main');
      document.body.addEventListener('click', onClick);
      window.addEventListener('popstate', refreshView);
    })
    .then(refreshView);

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

  function databaseOpen() {
    return new Promise(function(resolve, reject) {
      var version = 1;
      var request = indexedDB.open('news', version);
      request.onupgradeneeded = function(e) {
        db = e.target.result;
        e.target.transaction.onerror = reject;
        db.createObjectStore('news', { keyPath: 'guid' });
      };
      request.onsuccess = function(e) {
        db = e.target.result;
        resolve();
      };
      request.onerror = reject;
    });
  }

  function serverStoriesGet(guid) {
    return new Promise(function(resolve, reject) {
      superagent.get(api+'/' + (guid ? guid : ''))
        .end(function(err, res) {
          if (!err && res.ok) resolve(res.body);
          else reject(res);
        });
    });
  }
})();
