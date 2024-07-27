$(function() {

  var $searchHouseInput = $('.header .house-search')
  var $searchList = $('.header .search-list')
  var $searchTips = $('.header .search-tips')
  var $searchMenuUl = $('.header .search-menu > ul')
  var $searchArrow = $('.header .search-menu .arrow')

  var cacheSeacherListData = [] // 缓存热门推荐的数据
  var homePageInfoData = {} // 首页所有的数据

  var currentSearchPlaceHolder = '请输入区域、商圈或小区名开始'

  var currentSearchBarSelector = 'site'

  // 初始化页面
  initPage()

  // 监听搜索房子输入框的focus事件
  $searchHouseInput.on('focus', function() {

    // 如果 input 有数据, 搜索
    var value = $(this).val()
    if (value.trim()) {
      // 搜索房子, 通过代码模拟用户输入事件
      $(this).trigger('input')
      return
    }

    // 如果没有数据, 热门推荐

    if (cacheSeacherListData.length) {
      // 渲染界面
      renderSearchList(cacheSeacherListData)
      // 直接渲染界面
      return
    }

    // 发起网络请求获取 热门推荐 数据
    HYreq.get(HYAPI.HOT_RECOMMEND)
      .then(function(res) {

        var searchListData = res.rent_house_list.list || []

        if (!searchListData) {
          return
        }
        // searchListData -> sample [] 这里只需要其中一条数据,将复杂的数组映射为简单的数组
        searchListData = searchListData.map((item) => {
          return {
            title: item.app_house_title,
          }
        })
        // 优化代码,缓存数据
        cacheSeacherListData = searchListData


        // 渲染界面
        renderSearchList(cacheSeacherListData)
      })
  })

  $searchHouseInput.on('blur', function() {
    $searchTips.css('display', 'none')
  })

  $searchHouseInput.on('input', debounce(function () {
    var value = $(this).val()
    var curLocation = homePageInfoData.curLocation
    HYreq.get(HYAPI.HOME_SEARCH, {
      cityId: curLocation.cityCode,
      cityName: curLocation.city,
      channel: currentSearchBarSelector,
      keyword: value,
      query: value
    })
      .then(function (res) {
        console.log(res.data.result)

        var searchListData = res.data.result || []
        // 将复杂的数组转成简单的数组
        searchListData = searchListData.map(function (item) {
          return {
            title: item.hlsText || item.text
          }
        })
        console.log(searchListData)

        // 渲染列表
        renderSearchList(searchListData)
      })
  }))

  $searchMenuUl.on('click', 'li', function() {
    // 修改li的高亮
    var $li = $(this)
    $li.addClass('active').siblings().removeClass('active')

    // 移动箭头
    var liWidth = $li.width()
    var position = $li.position()
    var arrowleft = position.left + liWidth / 2
    $searchArrow.css('left', arrowleft)

    // 修改placeholder
    $searchHouseInput.prop({
      placeholder: currentSearchPlaceHolder + $li.text()
    })

    // 拿到搜索栏li中绑定的key
    // console.log($li.data('key'))
    currentSearchBarSelector = $li.data('key')

  })

  function initPage() {
    HYreq.get(HYAPI.HOME_PAGE_INFO)
      .then(function (res) {
        homePageInfoData = res
        // 渲染头部地址
        renderHeaderAddress(res)

        // 渲染搜索栏
        renderSearchBar(res)
      })
  }

  function renderSearchBar(res) {
    var searchBarData = res.searchMenus || []
    console.log(searchBarData)

    var htmlString = ''
    searchBarData.forEach(function(item, index) {
      var active = index === 0 ? 'active' : ''
      htmlString += `
      <li class="item ${active}" data-key="${item.key}"><span>${item.title}</span></li>
      `
    })
    $searchMenuUl.empty().append(htmlString)
  }

  function renderHeaderAddress(res) {
    // 更新左上角地址
    var addr = res.curLocation || {}
    $('.header .address').text(addr.city)
  }

  function renderSearchList(searchListData = []) {
    var htmlString = `<li><span>热门推荐</span></li>`

    searchListData.forEach(function(item) {
      htmlString += `<li><span>${item.title}</span></li>`
    })

    $searchList.empty().append(htmlString)
    $searchTips.css('display', 'block')
  }

})