import { h } from 'preact'
import { useEffect } from 'preact/hooks'

export default function EnlargeableImageModal({
  src,
  alt,
  modalWidth,
  modalHeight,
  onClose,
}) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      class="enlarge-modal active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        class="enlarge-modal-close"
        aria-label="Close"
        onClick={onClose}
      >
        &times;
      </button>
      <img
        src={src.src || src}
        alt={alt}
        width={modalWidth}
        height={modalHeight}
      />
    </div>
  )
}
