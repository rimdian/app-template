// ask parent window to refresh the app
export function refreshApp() {
  window.parent.postMessage(
    {
      type: 'refreshApp',
      data: {}
    },
    '*'
  )
}
