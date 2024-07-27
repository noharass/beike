; (function (window, $) {

  // 公共请求 request -> $.ajax
  function request(config = {}) {
    return $.ajax({
      url: config.url || '',
      method: config.method || 'GET',
      timeout: config.timeout || 5000,
      data: config.data || {},
      headers: config.headers || {},
      ...config
    })

  }

  // get -> $.get
  function get(url, data) {
    return request({
      url,
      method: 'GET',
      data
    })
  }

  // post -> $.post
  function post(url, data) {
    return request({
      url,
      method: 'POST',
      data
    })
  }

  window.HYreq = {
    request,
    get,
    post
  }

})(window, jQuery)