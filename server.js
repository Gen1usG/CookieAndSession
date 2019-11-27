var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)

  if (path === '/register.html' && method === 'POST') {
    response.statusCode = 200
    const userJSON = JSON.parse(fs.readFileSync('./db/user.json').toString())
    const array = []
    request.on('data', (chunks) => {
      array.push(chunks)
    })
    request.on('end', () => {
      const data = JSON.parse(Buffer.concat(array).toString())
      const lastuser = userJSON[userJSON.length - 1]
      const newobj = {
        'id': lastuser ? userJSON.length + 1 : 1,
        'account': data.account,
        'password': data.password
      }
      userJSON.push(newobj)
      fs.writeFileSync('./db/user.json', JSON.stringify(userJSON))
    })
    response.end()
  } else {
    response.statusCode = 200
    // 默认主页
    const filePath = path === '/' ? '/index.html' : path
    const suffix = filePath.substring(filePath.lastIndexOf('.'))
    const suffixTable = {
      '.js': 'text/javascript',
      '.html': 'text/html',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg'
    }
    response.setHeader('Content-Type', `${suffixTable[suffix] || 'text/html'};charset=utf-8`)
    let responseContent
    try {
      responseContent = fs.readFileSync(`./public${filePath}`)
    } catch (error) {
      response.statusCode = 404
      responseContent = '没有这个文件'
    }
    response.write(responseContent)
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)


