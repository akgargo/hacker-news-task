(() => {
  var socket = io();
  var username = 'victor', password = 'hello';
  socket.emit('getLatestEvents', { username: username, password: Base64().encode(password) });
  socket.on(`latestEventsTo_${username}`, function(posts) {
  console.log(posts)
    let result = '';
    let data = posts.common;
    
    if (data.length == 0) {
      result = '<a class="list-group-item">No posts to show</a>';
    } else {
      data.forEach((post) => {
        result += `<a id="${post.objectID}" class="list-group-item row" href="${post.story_url || post.url}">`
        + `<div class="col-md-10"><span class="title">${post.story_title || post.title}</span> <span class="author"> - ${post.author} - </span></div>`
        + `<div class="col-md-1"><span class="time">${formatDate(new Date(post.created_at))}</span></div>`
        + `<div class="delete col-md-1"></div>`
        + `</a>`;
      });
    }

    document.querySelector('#post-list').innerHTML = result;


    Array.prototype.slice.call(document.querySelectorAll('#post-list > a')).forEach((element) => {
      let objectID = element.getAttribute('id');
      let deleteButton = element.querySelector('div.delete');

      element.addEventListener('click', (event) => {
        event.preventDefault();
        window.open(element.getAttribute('href'),'_blank');
      }, false);

      deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        $.ajax({
          url: `/remove/${objectID}`,
          data: { username: username, password: Base64().encode(password) },
          method: 'POST'
        }).done(() => {
          $(element).remove();
        });
        return false;
      }, false);
    });
  });
})();