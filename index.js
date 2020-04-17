const fetch = require('node-fetch');

class ElementHandler {
    element(element) {
      if (element.tagName === 'title') {
        element.setInnerContent("Divyam's variant")
      }
      else if (element.tagName === 'h1' && element.getAttribute("id") === 'title') {
        element.setInnerContent("Hello!")
      }
      else if (element.tagName === 'p' && element.getAttribute("id") === 'description') {
        element.setInnerContent("This is my personalized page for the Cloudflare challenge")
      }
      else if (element.tagName === 'a' && element.getAttribute("id") === 'url') {
        element.setAttribute("href", "https://github.com/divbhasin")
        element.setInnerContent("Visit Divyam's Github")
      }
    }
}

// Taken from:
// https://developers.cloudflare.com/workers/templates/pages/cookie_extract/

function getCookie(request, name) {
    let result = null
    let cookieString = request.headers.get('Cookie')
    if (cookieString) {
          let cookies = cookieString.split(';')
          cookies.forEach(cookie => {
                  let cookieName = cookie.split('=')[0].trim()
                  if (cookieName === name) {
                            let cookieVal = cookie.split('=')[1]
                            result = cookieVal
                          }
                })
        }
    return result
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const cookie = getCookie(request, "variant")
  var url = ""

  if (!cookie) {
    const data = await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
    const json = await data.json()
    const urls = json.variants

    const random = Math.random() < 0.5 ? 0 : 1
    url = urls[random]
  }
  else {
    url = cookie
  }

  const res = await fetch(url)
  const transformed = new HTMLRewriter().on('*', new ElementHandler()).transform(res)

  const headers = new Headers(transformed.headers)

  if (!cookie) {
    headers.set("Set-Cookie", `variant=${url}`)
  }

  return new Response(await transformed.text(), {
    headers: headers
  })
}
