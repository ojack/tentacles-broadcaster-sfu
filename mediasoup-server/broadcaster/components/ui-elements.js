const html = require('choo/html')

const dropdownOptions = (options, selected) => html`
  ${options.map(
  opt => html`
    <option class="dark-gray" value=${opt.value} ${opt.value === selected
    ? 'selected'
    : ''}>${opt.label}</option>
  `
)}
`

const toggle = (val, onChange) => html`
  <input type="checkbox" checked=${val} onchange=${onChange} />
`

const expandable = (isOpen, content, maxHeight = '300px') => html`
  <div class="overflow-hidden" style="transition: max-height 1s;max-height:${isOpen
  ? maxHeight
  : 0}">
    ${content}
  </div>
`

const dropdown = (options, selected, onChange) => html`<select name="video-select" class="w-100 pa2 black ttu ba b--black pointer" style="background:none" onchange=${e => {
  onChange(e)
}}>${dropdownOptions(options, selected)}
</select>`

module.exports = {
  dropdown: dropdown,
  toggle: toggle,
  expandable: expandable
}
