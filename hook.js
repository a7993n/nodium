console.log('[NODIUM] Start preload hook...')

function buildProxy(target, handler) {
  const proxy = new Proxy(target, handler)
  proxy.originalTarget = target

  return proxy
}


function first_hook() {
  apply_handler = {
    apply: function (target, thisArg, args) {
      if (typeof args[1] === 'symbol' && args[1].description === '__APOLLO_CONTEXT__') {
        second_hook()
        // restore original Object.defineProperty
        Object.defineProperty = Object.defineProperty.originalTarget
      }
      return target.apply(thisArg, args)
    },
  }
  Object.defineProperty = buildProxy(Object.defineProperty, apply_handler)
}

function second_hook() {
  apply_handler = {
    apply: function (target, thisArg, args) {
      if ('postMeteringOptions' in args[2]) {
        args[2].postMeteringOptions = {
          referrer:'https://t.co/' + (1 + Math.random()).toString(36).substring(2, 12),
          sk:null,
          source:null
        }
      }
      return target.apply(thisArg, args)
    }
  }
  __APOLLO_CLIENT__.queryManager.getObservableFromLink = buildProxy(__APOLLO_CLIENT__.queryManager.getObservableFromLink, apply_handler)
  console.log('[NODIUM] Injected!')
}

checkingInterval = setInterval(function () {
  var html = document.getElementsByTagName('html')[0].innerHTML
  if (html.indexOf('content="com.medium.reader"', html.indexOf('NODIUM_END') + 300) != -1) {
    console.log('[NODIUM] The site is powered by Medium!')
    first_hook()
    clearInterval(checkingInterval)
  }
}, 100)

document.addEventListener('DOMContentLoaded', function (event) {
  clearInterval(checkingInterval)
})



// After 3 visits to the domain
function deleteCookies(){
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

var visits = 0;

document.addEventListener('DOMContentLoaded', function (event) {
  if (visits < 3) {
    visits++;
  } else {
    deleteCookies();
  }
})
// NODIUM_END


