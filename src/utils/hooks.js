'use strict'

import { useCallback, useEffect, useRef, useState } from 'react'
import debounce from 'lodash.debounce'

import { isRectInside } from './rect'

export function useTimeout (callback, delay) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function run () {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setTimeout(run, delay)
      return () => clearTimeout(id)
    }
  }, [delay])
}

export function useRefCallback () {
  const ref = useRef(null)

  const [element, setElement] = useState()

  const setRef = useCallback(node => {
    if (ref.current) setElement(undefined)
    if (node) setElement(node)
    ref.current = node
  }, [])

  return [setRef, element]
}

export function useVisibility (parentElement, delay = 100) {
  const [isVisible, setIsVisible] = useState(false)

  const [setRef, element] = useRefCallback()

  const checkVisibility = useCallback(
    debounce(() => {
      if (!element || !parentElement) return
      const parentRect = parentElement.getBoundingClientRect()
      const rect = element.getBoundingClientRect()
      const visible = isRectInside(parentRect, rect)
      setIsVisible(visible)
    }, delay),
    [element, parentElement, delay]
  )

  useEffect(() => {
    if (!parentElement) return
    parentElement.addEventListener('scroll', checkVisibility)
    return () => {
      checkVisibility.cancel()
      parentElement.removeEventListener('scroll', checkVisibility)
    }
  }, [parentElement, checkVisibility])

  useEffect(() => {
    checkVisibility()
  }, [checkVisibility])

  return [setRef, isVisible, element]
}
