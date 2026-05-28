const nextFocusableFieldSelector = [
  'input:not([type="hidden"])',
  'textarea',
  'select',
  'button[role="combobox"]',
  '[contenteditable="true"]',
].join(',')

type CurrentFormField = HTMLInputElement | HTMLTextAreaElement

function isHTMLElement(element: Element): element is HTMLElement {
  return element instanceof HTMLElement
}

function isDisabled(element: HTMLElement) {
  return (
    ('disabled' in element && Boolean(element.disabled)) ||
    element.getAttribute('aria-disabled') === 'true'
  )
}

function isReadOnly(element: HTMLElement) {
  return (
    ('readOnly' in element && Boolean(element.readOnly)) ||
    element.getAttribute('aria-readonly') === 'true'
  )
}

function isHidden(element: HTMLElement) {
  if (element.hidden || element.closest('[hidden], [aria-hidden="true"]')) {
    return true
  }

  const style = window.getComputedStyle(element)
  return style.display === 'none' || style.visibility === 'hidden'
}

function isFocusableField(element: Element): element is HTMLElement {
  return (
    isHTMLElement(element) &&
    !isDisabled(element) &&
    !isReadOnly(element) &&
    !isHidden(element) &&
    element.tabIndex >= 0
  )
}

export function focusNextFormField(currentField: CurrentFormField) {
  const form = currentField.form ?? currentField.closest('form')

  if (!form) {
    return false
  }

  const fields = Array.from(form.querySelectorAll(nextFocusableFieldSelector)).filter(
    isFocusableField,
  )
  const currentIndex = fields.indexOf(currentField)
  const nextField = currentIndex >= 0 ? fields[currentIndex + 1] : undefined

  if (!nextField) {
    return false
  }

  nextField.focus()
  return document.activeElement === nextField
}
