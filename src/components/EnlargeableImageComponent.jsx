import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { createPortal } from 'preact/compat'

export default function EnlargeableImageComponent({
  src,
  alt,
  className,
  width,
  height,
  modalWidth,
  modalHeight,
}) {
  const [showModal, setShowModal] = useState(false)
  const closeBtnRef = useRef(null)

  useEffect(() => {
    if (!showModal) return
    function handleKey(e) {
      if (e.key === 'Escape') setShowModal(false)
      if (e.key === 'Tab') {
        // Trap focus inside modal
        const focusable = [closeBtnRef.current]
        if (document.activeElement === focusable[0] && !e.shiftKey) {
          e.preventDefault()
          focusable[0].focus()
        }
      }
    }
    document.body.classList.add('modal-open')
    document.addEventListener('keydown', handleKey)
    // Focus the close button when modal opens
    closeBtnRef.current && closeBtnRef.current.focus()
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', handleKey)
    }
  }, [showModal])

  const modal = (
    <div
      class="enlarge-modal"
      role="dialog"
      aria-modal="true"
      tabIndex="-1"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowModal(false)
      }}
      style={{ outline: 'none' }}
    >
      <button
        ref={closeBtnRef}
        class="enlarge-modal-close"
        aria-label="Close"
        onClick={() => setShowModal(false)}
      >
        &times;
      </button>
      <img
        src={src.src || src}
        alt={alt}
      />
    </div>
  )

  return (
    <>
      <img
        src={src.src || src}
        alt={alt}
        class={`enlargeable-img ${className}`}
        width={width}
        height={height}
        onClick={() => setShowModal(true)}
      />
      {showModal && createPortal(modal, document.body)}
    </>
  )
}
