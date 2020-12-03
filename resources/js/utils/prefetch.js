const hoverTime = 100
const fetchers = {}
const doc = document.implementation.createHTMLDocument('prefetch')

function fetchPage (url, success) {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.setRequestHeader('VND.PREFETCH', 'true')
  xhr.setRequestHeader('Accept', 'text/html')
  xhr.onreadystatechange = () => {
    if (xhr.readyState !== XMLHttpRequest.DONE) return
    if (xhr.status !== 200) return
    success(xhr.responseText)
  }
  xhr.send()
}

function prefetchTurbolink (url) {
  fetchPage(url, responseText => {
    doc.open()
    doc.write(responseText)
    doc.close()
    const snapshot = Turbolinks.Snapshot.fromHTMLElement(doc.documentElement)
    Turbolinks.controller.cache.put(url, snapshot)
  })
}

function prefetch (url) {
  if (prefetched(url)) return
  prefetchTurbolink(url)
}

function prefetched (url) {
  return location.href === url || Turbolinks.controller.cache.has(url)
}

function prefetching (url) {
  return !!fetchers[url]
}

function cleanup (event) {
  const element = event.target
  clearTimeout(fetchers[element.href])
  element.removeEventListener('mouseleave', cleanup)
}

document.addEventListener('mouseover', event => {
  if (event.target.tagName !== 'A') return false
  const url = event.target.href
  if (prefetched(url) || prefetching(url)) return false
  cleanup(event)
  event.target.addEventListener('mouseleave', cleanup)
  fetchers[url] = setTimeout(() => prefetch(url), hoverTime)
})