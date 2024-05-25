import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon, { IconButton } from "Components/Icon/index.jsx";
import clamp from "Hooks/useClamp.jsx";
import "./style.css";

const Side_Margin = 20;
const MinSize = 60;

function useStateCurrent(setState) {
  return new Promise((res) => {
    setState((current) => {
      res(current);
      return current;
    });
  });
}

function getDistance({ x, y, x2, y2 } = {}) {
  let dx = x2 - x;
  let dy = y2 - y;

  return {
    dx: Math.abs(dx),
    dy: Math.abs(dy),
    distance: Math.sqrt(dx ** 2 + dy ** 2),
  };
}

function insideBox({ x, y, rect, margin = 0 } = {}) {
  let { x: x2, y: y2, height, width } = rect;

  if (!(x || y)) return;
  if (!(x2 || y2 || height || width)) return;

  let xInside = x >= x2 - margin && x <= x2 + width + margin;
  let yInside = y >= y2 - margin && y <= y2 + height + margin;

  return xInside && yInside;
}

function checkCenter(x, y, rect, setMousePlace) {
  let inside = insideBox({ x, y, rect });

  setMousePlace((currentMousePLace) => {
    return { ...currentMousePLace, inside };
  });

  return inside;
}

function checkSides(x, y, rect, setMousePlace) {
  let interactWithBox = insideBox({ x, y, rect, margin: Side_Margin });

  if (!interactWithBox) return;

  let left = getDistance({ x, y, x2: rect.x }).dx;
  let right = getDistance({ x, y, x2: rect.x + rect.width }).dx;
  let top = getDistance({ x, y, y2: rect.y }).dy;
  let bottom = getDistance({ x, y, y2: rect.y + rect.height }).dy;

  let inline = right < left ? ["right", right] : ["left", left];
  let block = top < bottom ? ["top", top] : ["bottom", bottom];

  let sides = [inline, block]
    .filter(([key, value], i) => value < Side_Margin)
    .map((x) => x?.[0]);

  setMousePlace((currentMousePLace) => {
    return { ...currentMousePLace, sides };
  });

  return sides;
}

export default function CapturingComponent({ onChange }) {
  let ref = useRef();
  let [mouseDown, setMouseDown] = useState("");
  let [activeState, setActiveState] = useState("");
  let [wrapperReversed, setWrapperReversed] = useState(false);
  let [rect, setRect] = useState({});
  let [startPoint, setStartPoint] = useState([0, 0]);
  let [endPoint, setEndPoint] = useState([0, 0]);
  let [mousePlace, setMousePlace] = useState({});
  let [lastMousePosition, setLastMousePosition] = useState([0, 0]);
  let [absolutePoints, setAbsolutePoints] = useState({
    left: [startPoint, setStartPoint],
    right: [endPoint, setEndPoint],
    top: [startPoint, setStartPoint],
    bottom: [endPoint, setEndPoint],
  });
  let [buttonFloat, setButtonFloat] = useState(true);

  async function MouseDown({ pageX, pageY, buttons, target }) {
    if(!(ref.current && target == ref.current || target.classList.contains('page-selection'))) return;
    if (1 != buttons) return;
    pageX -= scrollX;
    pageY -= scrollY;

    let [sX, sY] = startPoint;
    let [eX, eY] = endPoint;

    function changeTheAbsolutePoints() {
      let [left, right] = [
        [startPoint, setStartPoint],
        [endPoint, setEndPoint],
      ].sort((_) => sX >= eX);
      let [top, bottom] = [
        [startPoint, setStartPoint],
        [endPoint, setEndPoint],
      ].sort((_) => sY >= eY);
      setAbsolutePoints({ left, right, top, bottom });
    }

    setMouseDown(true);

    if (await useStateCurrent(setActiveState)) {
      let inside = checkCenter(pageX, pageY, rect, setMousePlace);
      let sides = checkSides(pageX, pageY, rect, setMousePlace);

      if (!inside && !sides) setActiveState(false);
    }

    if ((await useStateCurrent(setActiveState)) == "") {
      setStartPoint([pageX, pageY]);
      setEndPoint([pageX, pageY]);
      setActiveState("activated");
      addEventListener("mouseup", MouseUp);
      return;
    }

    addEventListener("mouseup", MouseUp);
    changeTheAbsolutePoints();
    setLastMousePosition([pageX, pageY]);
  }

  async function MouseUp() {
    setMouseDown(false);
    removeEventListener("mouseup", MouseUp);

    let activeState = await useStateCurrent(setActiveState);

    if (activeState == "activated") setActiveState("installed");
  }

  async function MouseMove({ pageX, pageY, buttons }) {
    if (1 != buttons || !mouseDown) return;
    let [lastX, lastY] = lastMousePosition;

    pageX -= scrollX;
    pageY -= scrollY;

    function controlTheArea() {
      let { inside, sides } = mousePlace;

      let dx = pageX - lastX;
      let dy = pageY - lastY;

      let { left, right, top, bottom } = absolutePoints;

      const Sides_Functions = {
        left: (_) => left[1]((current) => [current[0] + dx, current[1]]),
        right: (_) => right[1]((current) => [current[0] + dx, current[1]]),
        top: (_) => top[1]((current) => [current[0], current[1] + dy]),
        bottom: (_) => bottom[1]((current) => [current[0], current[1] + dy]),
      };

      if (sides && sides?.length > 0) {
        sides.forEach((side) => {
          Sides_Functions[side]?.();
        });
        return;
      }

      if (inside) {
        setStartPoint(startPoint.map((x, i) => x + [dx, dy][i]));
        setEndPoint(endPoint.map((x, i) => x + [dx, dy][i]));
        return;
      }
    }

    if ((await useStateCurrent(setActiveState)) == "activated")
      setEndPoint([pageX, pageY]);
    else controlTheArea();

    setLastMousePosition([pageX, pageY]);
  }

  function close(result) {
    result.x += scrollX
    result.y += scrollY
    onChange(result);
  }

  useEffect(() => {
    let maxX = document.documentElement.clientWidth,
      maxY = document.documentElement.clientHeight;
    let [sX, sY] = [],
      [eX, eY] = [];

    function updateStartPoint() {
      let current = startPoint.map((value, i) =>
        clamp({ min: 0, value, max: [maxX, maxY][i] })
      );
      sX = current[0];
      sY = current[1];
      if (current.find((item, index) => item != startPoint[index]) != undefined)
        setStartPoint(current);
    }

    updateStartPoint();

    function updateEndPoint() {
      let current = endPoint.map((value, i) =>
        clamp({ min: 0, value, max: [maxX, maxY][i] })
      );
      eX = current[0];
      eY = current[1];
      if (current.find((item, index) => item != endPoint[index]) != undefined)
        setEndPoint(current);
    }

    updateEndPoint();

    
    let dX = eX - sX;
    let dY = eY - sY;
    let isReverse = (dX < 0 || dY < 0) && !(dX < 0 && dY < 0);

    setWrapperReversed(isReverse);

    let rect = {
      x: sX + (dX < 0 ? dX : 0),
      y: sY + (dY < 0 ? dY : 0),
      width: Math.abs(dX),
      height: Math.abs(dY),
    };

    setButtonFloat(rect.width < MinSize || rect.height < MinSize);
    setRect(rect);
  }, [startPoint, endPoint]);

  let dialog = (
    <dialog
      ref={ref}
      className="page-selection-dialog"
      onMouseDown={MouseDown}
      onMouseMove={MouseMove}
    >
      <div className="header">
        <IconButton
          className={`cancel-btn ${buttonFloat ? "float" : ""}`}
          onClick={(_) => close(null)}
        >
          <Icon name="xmark" />
        </IconButton>
        <IconButton
          className={`submit-btn ${buttonFloat ? "float" : ""}`}
          onClick={(_) => close(rect)}
        >
          <Icon name="paper plane top" />
        </IconButton>
      </div>
      <div
        style={{
          left: rect.x,
          top: rect.y,
          ...rect,
        }}
        className={`page-selection ${activeState} ${
          wrapperReversed ? "reverse" : ""
        }`}
      >
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <span className="corner" style={{ "--i": i }} key={i}></span>
          ))}
      </div>
    </dialog>
  );

  useEffect((_) => ref.current?.showModal(), []);

  return createPortal(dialog, document.querySelector("#translate-popup-root"));
}

export function reducer(state, action) {
  let { type, provide } = action;
  if (type == "start") {
    return {
      ...state,
      capturing: 'started',
    };
  }

  if (type == "capturing") {
    return {
      ...state,
      capturing: 'capturing',
      ...(provide ? {value: provide} : {})
    };
  }

  if (type == "end") {
    return {
      capturing: 'ended',
      value: provide,
    };
  }
}
