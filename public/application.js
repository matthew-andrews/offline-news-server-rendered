(function() {
  var api = 'http' + (location.hostname === 'localhost' ? '://localhost:3000' : 's://offline-news-api.herokuapp.com') + '/stories';
  var synchronizeInProgress;
  var db, main;

  databaseOpen()
    .then(function() {
      main = document.querySelector('main');
      document.body.addEventListener('click', onClick);
      window.addEventListener('popstate', refreshView);

      // Only refresh the view if the view is empty
      if (main.innerHTML === '') return refreshView();
    })
    .then(synchronize);

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
      return databaseStoriesGet().then(renderAllStories);
    }
    renderOneStory();
    return databaseStoriesGetById(guid).then(renderOneStory);
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
    if (!story) story = { title: 'Story cannot be found', body: '<p>Please try another</p>' };
    main.innerHTML = '<nav><a class="js-link" href="/">&raquo; Back to FT Tech Blog</a></nav><h1>'+story.title+'</h1>'+story.body;
  }

  function synchronize() {
    if (synchronizeInProgress) return synchronizeInProgress;
    synchronizeInProgress = Promise.all([serverStoriesGet(), databaseStoriesGet()])
      .then(function(results) {
        var promises = [];
        var remoteStories = results[0];
        var localStories = results[1];

        // Add new stories downloaded from server to the database
        promises = promises.concat(remoteStories.map(function(story) {
          if (!arrayContainsStory(localStories, story)) {
            return databaseStoriesPut(story);
          }
        }));

        // Delete stories that are no longer on the server from the database
        promises = promises.concat(localStories.map(function(story) {
          if (!arrayContainsStory(remoteStories, story)) {
            return databaseStoriesDelete(story);
          }
        }));

        return promises;
      })

      // Only refresh the view if it's listing page and the items have changed
      // which we will determine if any of the results are not undefined
      .then(function(results) {
        var path = location.pathname+location.search;
        if (!results.every(function(item) { return item === undefined; }) && path === '/') {
          return refreshView();
        }
      })
      .then(function() {
        synchronizeInProgress = undefined;
      });
  }

  function arrayContainsStory(array, story) {
    return array.some(function(arrayStory) {
      return arrayStory.guid === story.guid;
    });
  }

  function databaseOpen() {
    return new Promise(function(resolve, reject) {
      var version = 1;
      var request = indexedDB.open('news', version);
      request.onupgradeneeded = function(e) {
        db = e.target.result;
        e.target.transaction.onerror = reject;
        db.createObjectStore('stories', { keyPath: 'guid' });
      };
      request.onsuccess = function(e) {
        db = e.target.result;
        resolve();
      };
      request.onerror = reject;
    });
  }

  function databaseStoriesPut(story) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction(['stories'], 'readwrite');
      var store = transaction.objectStore('stories');
      var request = store.put(story);
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  }

  function databaseStoriesGet() {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction(['stories'], 'readwrite');
      var store = transaction.objectStore('stories');

      var keyRange = IDBKeyRange.lowerBound(0);
      var cursorRequest = store.openCursor(keyRange);

      var data = [];
      cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if (result) {
          data.push(result.value);
          result.continue();
        } else {
          resolve(data);
        }
      };
    });
  }

  function databaseStoriesGetById(guid) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction(['stories'], 'readwrite');
      var store = transaction.objectStore('stories');
      var request = store.get(guid);
      request.onsuccess = function(e) {
        var result = e.target.result;
        resolve(result);
      };
      request.onerror = reject;
    });
  }

  function databaseStoriesDelete(story) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction(['stories'], 'readwrite');
      var store = transaction.objectStore('stories');
      var request = store.delete(story.guid);
      request.onsuccess = resolve;
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
