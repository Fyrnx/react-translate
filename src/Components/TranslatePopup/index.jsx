import { useEffect, useReducer, useState, use } from "react";
import { default as Icon, IconMask, IconButton } from "Components/Icon/index.jsx";
import { ActiveSelect } from "Components/Select/index.jsx";
import { SelectButton } from "Components/Select/SelectButton.jsx";
import CapturingComponent, { reducer as capturingReducer } from "Components/Capture/index.jsx";
import clamp from "Hooks/useClamp.jsx";
import translate from "Api/translate.jsx";
import useEventListener from "Hooks/useEventListener.jsx";
import langs from "Assets/langs.json";
import useOnMove from "Hooks/useOnMove.jsx";
import resizeSvg from "Assets/resize.svg";
import ImageViewer from "Components/ImageViewer/index.jsx"
import useExtensionState from "Hooks/useExtensionState.jsx"
import "./style.css"

/**
 * adds an event listener to the documentElement ( <html> ) and run the callback function when the event is fired
 * @param {string} type eventType
 * @param {function} callback function will be called when the event is triggered
 * @param {boolean} active toggle whether the event should be active
 */
function useResizeButton({ initialSize = { width: 0, height: 0 }, clampX, clampY }) {
  const [size, setSize] = useExtensionState('size',initialSize);
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [currSize, setCurrSize] = useState(null);

  function onMouseDown(event) {
    setDraggingPoint({ x: event.pageX, y: event.pageY });
    setCurrSize(size);
  }

  function onMouseMove(event) {
    if (!currSize) return;

    let width = clampX(currSize.width + event.pageX - draggingPoint?.x ?? 0);
    let height = clampY(currSize.height + event.pageY - draggingPoint?.y ?? 0);
    setSize(curr => {
      return {
        ...curr,
        ...(width ? { width } : {}),
        ...(height ? { height } : {})
      };
    });
  }

  function onMouseUp(event) {
    setDraggingPoint(null);
  }

  useEventListener("mousemove", onMouseMove, draggingPoint != null);
  useEventListener("mouseup", onMouseUp, draggingPoint != null);

  return { size, resize: onMouseDown };
}

function useDelayedEvent({ callback, noDelayCallback, delay }) {
  const [eventData, setEventData] = useState(null);
  const [timeSet, setTimeSet] = useState(false);

  useEffect(_ => {
    if (!eventData || timeSet) return;

    setTimeSet(true);
    setTimeout(_ => {
      callback(eventData);
      setEventData(null);
      setTimeSet(false);
    }, delay);
  }, [eventData]);

  function eventHandler(event) {
    setEventData(event);
    noDelayCallback(event);
  }

  return eventHandler;
}

/**
 * returns new object with out some properties
 * @param {object} object 
 * @param  {...string} keys 
 * @returns {object}
 */

function deleteProperty(object, ...keys) {
  let newObj = { ...object }
  keys.forEach(key => delete newObj[key])
  return newObj
}

export default function TranslatePopup() {
  const [lastID, setLastID] = useState(null);
  const [footerActive,setFooterActive] = useExtensionState('footerActive',false)

  const [capturingState, capturingDispatch] = useReducer(capturingReducer,{value: null, capturing: "ended"});
  const [activeSelect, setActiveSelect] = useState(null);
  const { size, resize } = useResizeButton({
    initialSize: { width: 500, height: 305 },
    clampX: (value) => clamp({ min: 340, value, max: 1000 }),
    clampY: (value) => clamp({ min: 200, value, max: 600 })
  });
  const [position, onMouseDown, moving, hotkeyEnabled] = useOnMove({ initialState: { x: 10, y: 10 }, margin: 10, distance: 100, hotkey: "a", size });
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromLang, setFromLang] = useState('au');
  const [toLang, setToLang] = useState('ar');
  const [detectedLang, setDetectedLang] = useState();
  const [lastFetchDate, setLastFetchDate] = useState();
  const [imageData, setImageData] = useState(null)
  
  function ImageToText(imageData) {}
  
  function translateFrom({ text = toText, from = fromLang, to = toLang } = {}) {
    let date = new Date();
    
    if (!text) {
      setLastFetchDate(date);
      setFromText('');
      return
    }
    
    if (fromLang == 'au' && !detectedLang) return;
    
    
    translate({ text, from: to, to: from }).then(({ text }) => {
      if (lastFetchDate && date < lastFetchDate) return;
      
      setLastFetchDate(date);
      setFromText(text);
    });
    
  }
  
  function translateTo({ text = fromText, from = fromLang, to = toLang } = {}) {
    let date = new Date();
    if (!text) {
      setLastFetchDate(date);
      setToText('');
      return
    }
    
    translate({ text, from, to }).then(({ text, lang }) => {
      setDetectedLang(lang);
      
      setLastFetchDate(date);
      setToText(text);
    });
  }
  
  const onFromChange = useDelayedEvent({
    callback: ({ target }) => translateTo({ text: target.value }),
    noDelayCallback: ({ target }) => setFromText(target.value),
    delay: 1000
  });
  
  const onToChange = useDelayedEvent({
    callback: ({ target }) => translateFrom({ text: target.value }),
    noDelayCallback: ({ target }) => {
      if (fromLang == 'au' && !detectedLang) return;
      setToText(target.value);
    },
    delay: 100
  });
  
  useEffect(_ => {
    if(!capturingState.value) return
    
    browser.runtime.sendMessage({type: "capture",rect: capturingState.value})
    .then(async (result) => {
      console.log(await result);
      capturingDispatch({ type: "end" })
    })
  }, [capturingState.value]);
  
  return (
    <ActiveSelect.Provider value={{ activeSelect, setActiveSelect, lastID, setLastID }}>
      {
      capturingState.capturing == "ended" &&
      <div
          className="translate-popup"
          style={{
            left: position.x,
            top: position.y,
            pointer: hotkeyEnabled ? "move" : "unset"
          }}
        >
          <main onMouseDown={onMouseDown} style={{ ...size, "cursor": hotkeyEnabled ? "move" : "default" }}>
            <textarea placeholder={fromLang == "au" ? `any ${detectedLang ? `( ${langs[detectedLang]} )` : ""}` : langs[fromLang]} disabled={moving} style={{ pointerEvents: hotkeyEnabled || moving ? "none" : "all", resize: "none", "cursor": hotkeyEnabled ? "move" : "text" }} value={fromText} onChange={onFromChange}></textarea>
            <textarea placeholder={langs[toLang]} disabled={moving} style={{ pointerEvents: hotkeyEnabled || moving ? "none" : "all", resize: "none", "cursor": hotkeyEnabled ? "move" : "text" }} value={toText} onChange={onToChange}></textarea>
            <div className="corner-buttons">
              <IconButton onClick={_ => setFooterActive(!footerActive)} shadow={true} style={{ transition: ".1s ease", rotate: footerActive ? "360deg" : "0deg", scale: footerActive ? "1 -1" : "1 1" }}>
                <Icon useGeneralStyle={true} name="chevron down" />
              </IconButton>
              <IconButton onMouseDown={resize} shadow={true}>
                <IconMask
                  data-nomove={true}
                  path={resizeSvg}
                  background="var(--interactive-color)"
                  style={{ width: 19, height: 19 }} />
              </IconButton>
            </div>
          </main>
          <footer style={{ position: "absolute", zIndex: -1, bottom: 0, transition: ".5s ease", translate: footerActive ? "0 calc(100% + 5px)" : `0 0` }}>
            <div style={{ flex: 1 }}>
              <IconButton
                onClick={(_) => {
                  if (fromLang == 'au' && detectedLang) setFromLang(detectedLang);
                  else setFromLang('au');
                }}
                className={`auto-detection ${fromLang} ${fromLang == "au" ? "active" : ""}`}
                noBackground={true}
              >
                <Icon name="sparkles" />
              </IconButton>
              <SelectButton
                updatePosition={size}
                options={langs}
                callback={(current) => {
                  setFromLang(current);
                  translateTo({ to: current });
                }}
                value={fromLang} />
              <IconButton onClick={_ => {
                if (fromLang == "au" && !detectedLang) return;
                setToLang(fromLang == "au" ? detectedLang : fromLang);
                setFromLang(toLang);
                setDetectedLang(null);
              }}>
                <Icon name="rotate reverse" />
              </IconButton>

              <SelectButton
                updatePosition={size}
                options={deleteProperty(langs, "au")}
                callback={(current) => {
                  setToLang(current);
                  translateTo({ to: current });
                }}
                value={toLang}
              />
            </div>
            <div>
              <button>
                <Icon name="microphone" />
              </button>
              <button onClick={(_) => capturingDispatch({ type: "start" })}>
                <Icon name="expand" version={2} />
              </button>
            </div>
          </footer>
          { imageData &&
              <ImageViewer style={{position: "absolute",top: 0,right: -5,translate: "100% 0"}} image={imageData} width={size.height} height={size.height} callback={(image) => {
                console.log(image)
              }} />
            }
        </div>
      }

      {
        capturingState.capturing == "started" &&
        <CapturingComponent
          onChange={(result) => {
            capturingDispatch({ type: "capturing", provide: result });
          }}
        />
      }


    </ActiveSelect.Provider>
  );
}


// TODO: clean up this ****
console.clear()