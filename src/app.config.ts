export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/collaborate/index',
    'pages/reply/index',
    'pages/stats/index',
    'pages/detail/index',
    'pages/create/index',
    'pages/template-edit/index',
    'pages/duty/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E5AA8',
    navigationBarTitleText: '校园舆情响应',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F0F4F8'
  },
  tabBar: {
    color: '#718096',
    selectedColor: '#1E5AA8',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '线索'
      },
      {
        pagePath: 'pages/collaborate/index',
        text: '协同'
      },
      {
        pagePath: 'pages/reply/index',
        text: '回复'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计'
      }
    ]
  }
})
