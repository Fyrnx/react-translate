import { createContext, useCallback, useEffect, useRef, useState} from "react";
import useHotkeys from "Hooks/useHotkeys.jsx";
import clamp from "Hooks/useClamp.jsx";
import "./style.css";


export const ActiveSelect = createContext();

function Option({ value, string, active, onClick }) {
  const ref = useRef();

  return (
    <>
      <button
        ref={ref}
        className={`option secondary${active ? " active" : ""}`}
        role="option"
        onClick={(_) => {
          onClick([value, string]);
        }}
      >
        {string}
      </button>
    </>
  );
}

function objectSearch(
  object,
  searchValue,
  {
    useKeys = true,
    useValues = true,
    caseSensitive = false,
    startingWith = true,
  } = {}
) {
  let entries = Object.entries(object);
  let byKey = [],
    byValue = [];
  let result = {};

  if (useKeys)
    byKey = Array.from(entries).filter(([key, value]) =>
      new RegExp(
        `${startingWith ? "^" : ""}${searchValue}`,
        caseSensitive ? "" : "i"
      ).test(key)
    );
  if (useValues)
    byValue = Array.from(entries).filter(([key, value]) =>
      new RegExp(
        `${startingWith ? "^" : ""}${searchValue}`,
        caseSensitive ? "" : "i"
      ).test(value)
    );

  byKey.concat(byValue).map(([key, value]) => (result[key] = value));
  return result;
}

/**
 *
 * @param {number} optionsLength number of options
 * @returns {[focusIndex, {
 *  set:Function,
 *  increase:Function,
 *  decrease:Function
 * }]}
 */

function useFocusHelper(optionsLength) {
  let [index, setIndex] = useState(null);

  
  function clampValue (value) {
    return clamp({min: 0,max: optionsLength,value,});
  }
  
  /**
   * set focus index = value
   * @param {number|function} value
   */

  function set(value) {
    if (index == null) return setIndex(0)


    if (typeof value === "function") setIndex(curr => clampValue(value(curr)))
    else setIndex(clampValue(value))
  }
  /** current + amount*/
  function increase(amount = 1) {
    set((curr) => curr + amount);
  }
  /** current - amount*/
  function decrease(amount = 1) {
    set((curr) => curr - amount);
  }

  return [index, { set, decrease, increase }];
}

/** @returns {[position: {},ref,function]} */

export function useElementPosition() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
  });
  const [node, setNode] = useState();

  const ref = useCallback((node) => {
    if (node !== null) {
      setNode(node);
    }
  }, []);

  function update({ durationMS = null, delay = 100 } = {}) {
    if (!node) return;
    setPosition(node.getBoundingClientRect());
    if (durationMS != null) {
      let int = setInterval(
        (_) => setPosition(node.getBoundingClientRect()),
        delay
      );

      if (durationMS != 0) setTimeout((_) => clearInterval(int), durationMS);
    }
  }

  return [position, ref, update];
}

function scrollFunction(index, { current } = {}) {
  if (!current) return

  let focusedEle = current.querySelector('.option.focus')
  let ele = current.querySelectorAll('.option')[index]
  if (!ele) return

  focusedEle?.classList.remove('focus')
  ele?.classList.add('focus')

  let height = current?.offsetHeight;
  let eleTop = ele.offsetTop;
  let eleHeight = ele.offsetHeight;

  if (top != undefined && eleTop != undefined)
    current.scrollTo(
      0,
      eleTop - (height / 2 - eleHeight)
    );
}

function generateOptions(optionsObject, selectOption, value) {
  return Object.entries(optionsObject).map(([key, string], index) => {
    return (
      <Option
        key={key}
        value={key}
        active={key == value}
        string={string}
        onClick={() => selectOption(index)}
      />
    );
  })
}

export default function Select({ options, callback, value, searchValue, active = false, position }) {

  if (!options) return <></>;
  const [optionsArray, setOptionsArray] = useState(generateOptions(options, selectOption, value));

  let componentRef = useRef();
  let [focusIndex, focusIndexActions] = useFocusHelper(Object.entries(options).length);

  function selectOption(index = focusIndex) {
    if (index < 0) callback(undefined);

    callback(optionsArray[index]);
  }

  useEffect(_ => {
    options = objectSearch(options, searchValue)
    setOptionsArray(generateOptions(options, selectOption, value))
  if(searchValue == "") return
    focusIndexActions.set(0);
    setTimeout(_ => scrollFunction(focusIndex, componentRef),100)
  }, [searchValue, active]);

  useHotkeys({
    active,
    preventDefault: true,
    hotkeys: {
      "up, tab + shift": _ => focusIndexActions.decrease(),
      "up + shift": _ => focusIndexActions.decrease(10),
      "down, tab": _ => focusIndexActions.increase(),
      "down + shift": _ => focusIndexActions.increase(10),
      "escape": _ => selectOption(-1),
      "enter": _ => selectOption(),
    }
  });

  scrollFunction(focusIndex, componentRef)

  return active ? (<>
    <div
      ref={componentRef}
      style={{ zIndex: 1, left: position.x, top: position.y + 40, opacity: position.x == 0 && position.y == 0 ? 0 : 1 }}
      onKeyDown={(e) => e.preventDefault()}
      className="select-popup"
    >
      {optionsArray}
    </div>
  </>) : (
    <></>
  );
}