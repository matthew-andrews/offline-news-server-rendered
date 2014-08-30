module.exports = {
  article: article,
  list: list,
  shell: shell,
  manifest: manifest
};

function article(data) {
  return shell({
    title: data.title,
    main: '<nav><a class="js-link" href="/">&raquo; Back to FT Tech Blog</a></nav><h1>'+data.title+'</h1>'+data.body
  });
}

function list(data) {
  var ul = '';
  data.forEach(function(story) {
    ul += '<li><a class="js-link" href="/'+story.guid+'">'+story.title+'</a></li>';
  });
  return shell({
    main: '<h1>FT Tech Blog</h1><ul>'+ul+'</ul>'
  });
}

function shell(data) {
  data = {
    title: data && data.title || 'FT Tech News',
    main: data && data.main || ''
  };
  return '<!DOCTYPE html>'
    + '<html>'
    + '  <head>'
    + '    <title>'+data.title+'</title>'
    + '    <link rel="stylesheet" href="/styles.css" type="text/css" media="all" />'
    + '  </head>'
    + '  <body>'
    + '    <div class="brandrews"><a href="https://mattandre.ws">mattandre.ws</a> | <a href="https://twitter.com/andrewsmatt">@andrewsmatt</a></div>'
    + '    <main>'+data.main+'</main>'
    + '    <script src="/indexeddb.shim.min.js"></script>'
    + '    <script src="/superagent.js"></script>'
    + '    <script src="/promise.js"></script>'
    + '    <script src="/application.js"></script>'
    + '  </body>'
    + '</html>';
}

function manifest() {
  return 'CACHE MANIFEST'
    + '\n./styles.css'
    + '\n./indexeddb.shim.min.js'
    + '\n./promise.js'
    + '\n./superagent.js'
    + '\n./application.js'
    + '\n'
    + '\nFALLBACK:'
    + '\n/ /'
    + '\n'
    + '\nNETWORK:'
    + '\n*';
}
