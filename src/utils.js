export const getFlatList = node => {
  let array = []
  flatten(array, node)
  return array

  function flatten(arr, node) {
    arr.push(node)
    if (node.children) {
      node.children.forEach(child => flatten(arr, child))
    }
  }
}
