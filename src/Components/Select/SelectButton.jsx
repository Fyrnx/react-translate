import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon, { IconButton } from "Components/Icon/index.jsx";
import useDisableScrolling from "Hooks/useDisableScrolling.jsx";
import Select, { ActiveSelect, useElementPosition } from "./index.jsx";

export function SelectButton({ options, callback, value, placeholder, updatePosition }) {
  let { activeSelect, setActiveSelect, setLastID } = useContext(ActiveSelect);

  let [currentValue, setCurrentValue] = useState(value == undefined && placeholder ? placeholder : value);
  let [searchValue, setSearchValue] = useState("");
  let [id,setID] = useState();
  let [position, positionRef, updatePs] = useElementPosition({durationMS: 0});
  let [inputChanged,setInputChanged] = useState(false)

  useEffect(_ => {
    setCurrentValue(value)
    setSearchValue(options[value])
  }, [value]);

  useEffect(_ => {
    new Promise(res => {
      setLastID(curr => {
        const id = curr != null ? curr + 1 : 0
        res(id)
        return id
      })
    })
    .then(id => setID(id))
  },[]) // create new id for the selector ( the id used to prevent multiple popups at the same time )

  let inputRef = useRef();

  let { disable: disableScroll, enable: enableScrolling } =
    useDisableScrolling();

  let onSelectFunction = ({key}) => {
    setActiveSelect(null);

    if (key == undefined) return;
    setCurrentValue(key);
    callback(key);
  };

  useEffect(_ => {
    activeSelect ? disableScroll() : enableScrolling();

    setInputChanged(false)
    if (activeSelect === id) inputRef?.current?.focus();
    updatePs({ durationMS: 300, delay: 100 });
  }, [activeSelect, updatePosition]);

  let button = (
  <button 
    className="select-btn"
    onClick={_ => setActiveSelect(id)}
  >
    {options[currentValue]}
  </button>
  );

  let searchInput = (<>
    <input ref={inputRef}
      value={searchValue}
      onInput={(event) => { 
        setInputChanged(true)
        setSearchValue(event.target.value)
      }}
    />
    <IconButton
      shadow={true}
      onClick={_ => setActiveSelect(null)}
    >
      <Icon name="xmark" />
    </IconButton>
  </>);

  let wrapper = (<>
    <div ref={positionRef}
      className={`select-search ${activeSelect === id ? "active" : ""}`}
    >
      {activeSelect === id ? searchInput : button}
    </div>

    {createPortal(
      <Select
        position={position}
        searchValue={inputChanged ? searchValue : ""}
        options={options}
        value={currentValue ?? value}
        active={activeSelect === id}
        callback={onSelectFunction}
      />,

      document.querySelector("#translate-popup-root")
    )}
  </>);

  return wrapper;
}
