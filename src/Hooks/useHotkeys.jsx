import useEventListener from "Hooks/useEventListener.jsx";

/*
* convert some event.key values to more ease and more used values
* the key used to check the hotkey key in lowerCase and the value is the converted value to match the event.key
*/

export const hotkeyMap = {
  "arrowup": "up",
  "arrowdown": "down",
  "arrowleft": "left",
  "arrowright": "right",
  "tab": "tab",
  "escape": "escape",
  "backspace": "backspace",
  "enter": "enter"
} // all the keys are lower case for case insensitive comparison

export const hotkeyReverseMap = {
  "up": "ArrowUp",
  "down": "ArrowDown",
  "left": "ArrowLeft",
  "right": "ArrowRight",
  "tab": "Tab",
  "escape": "Escape",
  "backspace": "Backspace",
  "enter": "enter"
} // all the keys are lower case for case insensitive comparison

/**
 * take the hotkey (single) string and the event and return if the event matches the regiments in the hotkey string
 * @param {string} hotkey string for instructions about the hotkey needed to match
 * @param {Event} event keydown event
 * @returns {boolean} if the event matches the regiments in the hotkey string
 */

function disassembleHotkey(hotkey, event) {
  let obj = {}
  let keys = hotkey.split(/(?<!\()\+/g).filter(x => x != '')

  keys?.every(key => {

    if (key == undefined) return true
    key = key.replace(/[ \(\)]/g, '')
    if (hotkeyReverseMap[key.toLowerCase()]) key = hotkeyReverseMap[key.toLowerCase()]

    if (['shift', 'ctrl', 'alt'].find(x => x == key?.toLowerCase()) != null) obj[key] = true
    else obj.key = key

    return true
  })



  let
    is_shift = !!obj.shift == !!event.shiftKey, // check if no shift required of the shift is pressed in the event
    is_ctrl = !!obj.ctrl == !!event.ctrlKey, // check if no ctrl required of the ctrl is pressed in the event
    is_alt = !!obj.alt == !!event.altKey, // check if no alt required of the alt is pressed in the event
    is_key = obj.key == "*" || obj.key == undefined || (is_shift ? event.key.toLowerCase() == obj.key.toLowerCase() : event.key == obj.key) // check if there is no key required or the key in the event matches the required key

    return (is_key && is_shift && is_ctrl && is_alt)
}

/**
 * sprite multiple hotkeys and return if the event matches any of them
 * @param {string} hotkey hotkey string to pass to f( checkSingleHotkey )
 * @param {Event} event keydown event to pass to f( checkSingleHotkey )
 * @returns {boolean} if any of the hotkeys matches with the event
 */

function disassembleHotkeys(hotkeys, event) {
  return hotkeys.split(/(?<!\(),/g).some(x => disassembleHotkey(x, event))
}

/**
 * custom hook for adding & managing hotkeys
 * @param {Object} object
 * @param {{hotkey: function}} object.hotkeys object of hotkeys
 * @param {boolean} object.active toggle the hotkeys
 * @param {boolean} object.stopPropagation if turned on all functions will run event.stopPropagation() in the start of the function
 * @param {boolean} object.preventDefault if turned on all functions will run event.preventDefault() in the start of the function
 * @param {{key: value}} object.dependency object of any variables used in the hotkeys function
 * 
 * ( when the dependency is changed the main function will be changed to use the new values)
 * 
 * @returns void
 */

export default function useHotkeys({ active = false, hotkeys = {}, hotkeysReleased = {}, stopPropagation = false, preventDefault = false } = {}) {
  useEventListener('keydown', event => {

    Object.entries(hotkeys).forEach(([key, callback]) => {
      let state = disassembleHotkeys(key, event)

      if (state) {
        if (preventDefault) event.preventDefault()
        if (stopPropagation) event.stopPropagation()
        callback(event)
      }
    })
  }, active)

  useEventListener('keyup', event => {
    Object.entries(hotkeysReleased).forEach(([key, callback]) => {
      let state = disassembleHotkeys(key, event)
      if (state) {
        if (preventDefault) event.preventDefault()
        if (stopPropagation) event.stopPropagation()
        callback(event)
      }
    })
  }, active)
}

// [x]FIXME: remove dependency like (useEventListener)
// BUG: key + alt not working properly EX: (m + alt)
// TODO: implement once functionality
