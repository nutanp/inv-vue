import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Inventory Adjustment'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
