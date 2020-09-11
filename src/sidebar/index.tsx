import React, { useReducer, useState } from "react";
import { ReactComponent as Hamburger } from "./hamburger.svg";
import "./sidebar.css";

interface IPropTypes {
  onSubFilterChange: (filterValues: { filterType: IEventTypes }) => void;
  onFilterClear: () => void;
}

interface IEventTypes {
  only: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  name: string;
  city: string;
}

type Actions =
  | { type: "ON_FILTER_CHANGE"; updatedState: IEventTypes }
  | { type: "CLEAR_FILTER" };

interface IState {
  filterType: IEventTypes;
}

const initialState: IState = {
  filterType: {
    only: false,
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
    name: "",
    city: "",
  },
};

const reducer: React.Reducer<IState, Actions> = (state, action) => {
  switch (action.type) {
    case "ON_FILTER_CHANGE":
      return { ...state, filterType: action.updatedState };
    case "CLEAR_FILTER":
      return {
        ...state,
        filterType: {
          only: false,
          morning: false,
          afternoon: false,
          evening: false,
          night: false,
          name: "",
          city: "",
        },
      };
    default:
      throw new Error();
  }
};

const Sidebar = ({ onSubFilterChange, onFilterClear }: IPropTypes) => {
  const [state, dispatch] = useReducer<React.Reducer<IState, Actions>>(
    reducer,
    initialState
  );

  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);

  const handleMenuClick = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let existingState: IState = { ...state };
    existingState.filterType[e.target.name] = e.target.value;
    onSubFilterChange(existingState);

    dispatch({
      type: "ON_FILTER_CHANGE",
      updatedState: existingState.filterType,
    });
  };

  const handleCheckBox = (changedOn: string) => {
    let existingState: IState = { ...state };
    existingState.filterType[changedOn] = !existingState.filterType[changedOn];

    onSubFilterChange(existingState);
    dispatch({
      type: "ON_FILTER_CHANGE",
      updatedState: existingState.filterType,
    });
  };

  const handleClearFilter = () => {
    dispatch({
      type: "CLEAR_FILTER",
    });
    onFilterClear();
  };

  return (
    <aside className="aside-wrapper">
      <div className={`menu-wrapper`}>
        <Hamburger className={`menu-icon `} onClick={handleMenuClick} />
      </div>
      <div className={`aside-items ${isMenuOpen ? "menu-visible" : ""}`}>
        <input
          placeholder="Name"
          className="search-box"
          name="name"
          value={state?.filterType?.name}
          onChange={handleTextChange}
        />
        <input
          placeholder="City"
          className="search-box"
          name="city"
          value={state?.filterType?.city}
          onChange={handleTextChange}
        />
        <div className="check-box-wrapper">
          {Object.keys(state?.filterType).map((key: string, index: number) => {
            return (
              <div className="filter-wrap" key={index}>
                {key !== "name" && key !== "city" && (
                  <>
                    <input
                      type="checkbox"
                      name={key}
                      onChange={() => handleCheckBox(key)}
                      checked={state?.filterType[key]}
                      value={key}
                    />

                    <label className="filter-label">{key}</label>
                    {key === "only" ? (
                      <span className="free-batch"> Free</span>
                    ) : (
                      ""
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <button className="clear-btn" onClick={handleClearFilter}>
          Clear filter
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
