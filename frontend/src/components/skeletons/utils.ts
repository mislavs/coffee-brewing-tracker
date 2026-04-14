export function getSkeletonVisibilityClassName(index: number) {
  if (index === 3) {
    return 'hidden sm:block'
  }

  if (index >= 4) {
    return 'hidden xl:block'
  }

  return undefined
}
