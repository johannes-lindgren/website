import { useState } from 'preact/hooks'

export default function WineTypeFilterEN() {
  const [wineType, setWineType] = useState('all')

  const handleChange = (e) => {
    const selectedType = e.target.value
    setWineType(selectedType)

    // Show/hide rows based on wine type
    const allRows = document.querySelectorAll('[data-wine-type]')
    allRows.forEach((row) => {
      const rowTypes = row.dataset.wineType.split(',')
      if (selectedType === 'all' || rowTypes.includes(selectedType)) {
        row.style.display = ''
      } else {
        row.style.display = 'none'
      }
    })
  }

  return (
    <div class="not-prose my-6 rounded-lg border border-black/15 bg-white p-4 dark:border-white/20 dark:bg-black/5">
      <fieldset>
        <legend class="mb-3 font-semibold text-black dark:text-white">
          Filter aromas:
        </legend>
        <div class="flex gap-6">
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="wine-type"
              value="all"
              checked={wineType === 'all'}
              onChange={handleChange}
              class="h-4 w-4 cursor-pointer accent-black dark:accent-white"
            />
            <span class="text-sm">All</span>
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="wine-type"
              value="red"
              checked={wineType === 'red'}
              onChange={handleChange}
              class="h-4 w-4 cursor-pointer accent-black dark:accent-white"
            />
            <span class="text-sm">Red Wine</span>
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="wine-type"
              value="white"
              checked={wineType === 'white'}
              onChange={handleChange}
              class="h-4 w-4 cursor-pointer accent-black dark:accent-white"
            />
            <span class="text-sm">White Wine</span>
          </label>
        </div>
      </fieldset>
    </div>
  )
}
