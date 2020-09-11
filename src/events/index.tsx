import React, { useEffect, useReducer, useState } from "react";
import axios from "axios";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import debounce from "lodash/debounce";
import Navbar from "../navbar";
import Sidebar from "../sidebar";
import ModalComponent from "../ui-elements/modal";
import { groupByDate, getDifferenceInMinutes } from "../helpers/functions";
import eventIcon from "./eventIcon.png";
import { ReactComponent as Loader } from "./loader.svg";

import "./events.css";
import "react-toastify/dist/ReactToastify.css";

interface IEventTypes {
  id: number;
  city: number;
  endDate: Date;
  isFree: boolean;
  name: string;
  startDate: Date;
  cityName?: string;
  period?: string;
  isRegistered?: boolean;
}

interface IEventGroup {
  date: string;
  events: IEventTypes[];
}

interface IState {
  eventList: IEventTypes[];
  isSignUpModalOpen: boolean;
  selectedEvent: IEventTypes | null;
  selectedFilter: string;
  eventCount:number,
}

interface IFilter {
  filterType: IFilterTypes;
}

interface IFilterTypes {
  only: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  name:string,
  city:string
}

interface ICities {
  id: number;
  name: string;
}
 
type Actions =
  | { type: "ALL_EVENTS"; allEvents: IEventGroup[] }
  | { type: "SIGN_UP_MODAL_OPEN"; event: IEventTypes }
  | { type: "SIGN_UP_SUCCESS" }
  | { type: "SIGN_UP_MODAL_CLOSE" }
  | { type: "CANCEL_EVENT"; filterValue: IEventGroup[] }
  | { type: "FILTER_CHANGE"; filterValue: any[]; filterType: string,eventCount:number };

const initialState: IState = {
  eventList: [],
  isSignUpModalOpen: false,
  selectedEvent: null,
  selectedFilter: "all_events",
  eventCount:1
};

const initialSubFilter : IFilter={
  filterType: {
    only: false,
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
    name: "",
    city: "",
  }
}

/**
 * @param registerStatus is used to identify between event register and cancel will be true for new event register
 *                      ,Since this function is used for both
 */

const updateSelectedEvent = (state: any, registerStatus: boolean) => {
  let updatedEvent = { ...state };
  updatedEvent?.eventList?.map((eachEventGroup: IEventGroup) => {
    eachEventGroup?.events?.map((eachEvents: IEventTypes) => {
      if (eachEvents?.id === updatedEvent?.selectedEvent?.id) {
        eachEvents.isRegistered = registerStatus;
      }
    });
    if (!registerStatus) {
      // for removing the cancelled events from my-events list
      eachEventGroup.events = eachEventGroup.events.filter(
        (eachEvents: IEventTypes) =>
          eachEvents?.id !== updatedEvent?.selectedEvent?.id
      );
    }
  });

  if (registerStatus) {
    sessionStorage.setItem("events", JSON.stringify(updatedEvent.eventList));
    toast("Registered Successfully", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
    });
  } else {
    // updating the event status in session store in real case things would be a update to database
    let existingValue:IEventGroup[] =
      sessionStorage.getItem("events") &&
      JSON.parse(sessionStorage.getItem("events") || "");
      
      existingValue?.map((eachEventGroup: IEventGroup) => {
        eachEventGroup?.events?.map((eachEvents: IEventTypes) => {
          if (eachEvents.id === updatedEvent?.selectedEvent?.id) {
            eachEvents.isRegistered = registerStatus;
          }
        });
      });
    sessionStorage.setItem("events", JSON.stringify(existingValue));

    toast("Event Cancelled !", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
    });
  }

  return updatedEvent.eventList;
};

const reducer: React.Reducer<IState, Actions> = (state, action) => {
  switch (action.type) {
    case "ALL_EVENTS":
      return { ...state, eventList: action.allEvents };

    case "SIGN_UP_MODAL_OPEN":
      return { ...state, isSignUpModalOpen: true, selectedEvent: action.event };

    case "SIGN_UP_SUCCESS":
      let result:IEventTypes[] = updateSelectedEvent(state, true);
      
      return {
        ...state,
        eventList: result,
        isSignUpModalOpen: false,
        selectedEvent: null,
      };

    case "CANCEL_EVENT":
      return { ...state, selectedEvent: null, eventList: action.filterValue };

    case "SIGN_UP_MODAL_CLOSE":
      return { ...state, isSignUpModalOpen: false, selectedEvent: null };

    case "FILTER_CHANGE":
      return {
        ...state,
        eventList: action.filterValue,
        selectedFilter: action.filterType,
        eventCount: action.eventCount
      };

    default:
      throw new Error();
  }
};

const Events = () => {
  const [state, dispatch] = useReducer<React.Reducer<IState, Actions>>(reducer,initialState);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSubFilter,setSelectedSubFilter] = useState<IFilter>(initialSubFilter);

  useEffect(() => {
    setIsLoading(true);

    let existingValue:IEventGroup[] = sessionStorage.getItem("events") && JSON.parse(sessionStorage.getItem("events") || "");

    if (existingValue?.length) {
      setIsLoading(false);
      dispatch({ type: "ALL_EVENTS", allEvents: existingValue });
    } else {
      axios.all(
        [axios.get("https://run.mocky.io/v3/ab19b8f2-5677-4b11-9283-46aa905ec0ab"),
          axios.get("https://run.mocky.io/v3/2337680b-3019-4cb8-937d-fecc492bf4cf"),
        ])
        .then((responseArr) => {
          groupEventsByDate(responseArr?.[0]?.data, responseArr?.[1]?.data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log("Error Occurred during Api fetch", err);
        });
    }
  }, []);

  const groupEventsByDate = (cities: ICities[], events: IEventTypes[]) => {
    const result = groupByDate(cities, events);

    sessionStorage.setItem("events", JSON.stringify(result));

    dispatch({ type: "ALL_EVENTS", allEvents: result });
  };

  const handleSignUp = (event: IEventTypes) => {
    dispatch({
      type: "SIGN_UP_MODAL_OPEN",
      event,
    });
  };

  const closeSignUpModal = () => {
    dispatch({
      type: "SIGN_UP_MODAL_CLOSE",
    });
  };

  const handleEventConfirmation = () => {
    dispatch({
      type: "SIGN_UP_SUCCESS",
    });
  };

  const handleEventCancel = (events: IEventTypes) => {
    let existingState:IState = { ...state };
    existingState.selectedEvent = events;
    let cancelledEventValue = updateSelectedEvent(existingState, false);
    dispatch({
      type: "CANCEL_EVENT",
      filterValue: cancelledEventValue,
    });
  };

  const handleFilter = (value: string) => {
    if (value !== state.selectedFilter) {
      setIsLoading(true)
      let existingState:IState = { ...state };
      let eventCount:number=0;
      // prevents filtering the values for same filter twice
      let filteredEvents:IEventTypes[] = existingState.eventList;
      if (value === "my_events") {
        filteredEvents.map((eachEventGroup: any) => {
          eachEventGroup.events =  eachEventGroup.events.filter(
             (eachEvents: IEventTypes) => eachEvents.isRegistered === true
          );
          eventCount = eachEventGroup?.events?.length ? eventCount+1:eventCount
          return eachEventGroup.events
        });
        dispatch({
          type: "FILTER_CHANGE",
          filterValue: filteredEvents,
          filterType: value,
          eventCount
        });
        sessionStorage.setItem("my_events", JSON.stringify(filteredEvents)); //to filter morning,afternoon,.. based on my_events
      } else {
        existingState.selectedFilter='all_events'
        handleSubFilterChange(selectedSubFilter,existingState) // to check the sub filters on changing between my events & all events
      }
      setIsLoading(false)
    }
   
  };

  /**
   * @param selectedSubFilter holds all the subFilter values like name,city and checkboxes 
   */

  const handleSubFilterChange = debounce((selectedSubFilter: IFilter, existingState:IState=state) => {
    setIsLoading(true)
    let unModifiedEvents:IEventGroup[] =
      existingState?.selectedFilter === "my_events"
        ? existingState.eventList
        : JSON.parse(sessionStorage.getItem("events") || "");

    let filteredEvents:IEventGroup[] = [...unModifiedEvents];
    let eventCount:number=0;

    if ( // to handle unCheck of all filters
      !selectedSubFilter?.filterType?.only &&
      !selectedSubFilter?.filterType?.morning &&
      !selectedSubFilter?.filterType?.afternoon &&
      !selectedSubFilter?.filterType?.evening &&
      !selectedSubFilter?.filterType?.night &&
      selectedSubFilter?.filterType?.name==="" &&
      selectedSubFilter?.filterType?.city==="" 
    ) {
      filteredEvents = existingState?.selectedFilter==="my_events"?JSON.parse(sessionStorage.getItem("my_events") || ""): JSON.parse(sessionStorage.getItem("events") || "");
      eventCount = filteredEvents?.length
    } else {
      filteredEvents.map((eachEventGroup: IEventGroup) => {
        eachEventGroup.events = eachEventGroup?.events?.filter(
          (eachEvents: IEventTypes) =>
          ((selectedSubFilter?.filterType?.name!=="" && 
            eachEvents?.name?.toLowerCase()?.includes(selectedSubFilter?.filterType?.name?.toLowerCase())) ||
           (selectedSubFilter?.filterType?.city!=="" && 
             eachEvents?.cityName?.toLowerCase()?.includes(selectedSubFilter?.filterType?.city?.toLowerCase())) ||
            (selectedSubFilter?.filterType?.only &&
              eachEvents?.isFree ===
                selectedSubFilter?.filterType?.only) ||
            (selectedSubFilter?.filterType?.morning &&
              eachEvents?.period === "morning") ||
            (selectedSubFilter?.filterType?.night &&
              eachEvents?.period === "night") ||
            (selectedSubFilter?.filterType?.afternoon &&
              eachEvents?.period === "afternoon") ||
            (selectedSubFilter?.filterType?.evening &&
              eachEvents?.period === "evening")
        ));
        eventCount = eachEventGroup?.events?.length ? eventCount+1:eventCount
        return eachEventGroup.events
      });
    }

    dispatch({
      type: "FILTER_CHANGE",
      filterValue: filteredEvents,
      filterType: existingState?.selectedFilter,
      eventCount
    });

    setSelectedSubFilter(selectedSubFilter)
    setIsLoading(false)
  },400);

  const handleClearFilter = () => {
    let unModifiedEvents:IEventTypes[] = JSON.parse(sessionStorage.getItem("events") || "");
   
    dispatch({
      type: "FILTER_CHANGE",
      filterValue: unModifiedEvents,
      filterType: "all_events",
      eventCount : unModifiedEvents?.length
    });
    setSelectedSubFilter(initialSubFilter);
  };

  return (
    <div className="container">
      <Navbar onFilterChange={handleFilter} activeFilter={state?.selectedFilter}/>
      <div className="event-wrapper">
        <Sidebar
          onSubFilterChange={handleSubFilterChange}
          onFilterClear={handleClearFilter}
        />
        {isLoading ? <div className="loader center-place"><Loader/></div> : ""}
        {state?.eventCount===0? <div className="center-place">No Results Found!</div> : ""}

        <div className="event-list-wrapper">
          {state?.eventList?.map((eachEventGroup: any,index:number) => {
            return (
              <div key={index}>
                {eachEventGroup?.events?.length ? (
                  <div  className="event-card-wrapper">
                    <>
                      <p className="date-group">
                        {moment(eachEventGroup.date).format("dddd,Do MMMM")}
                      </p>

                      {eachEventGroup.events.map((eachEvents: IEventTypes) => (
                        <div key={eachEvents?.id} className="event-card">
                          <div className="event-card-name">
                            <div className="event-name">
                              {" "}
                              {eachEvents.isFree ? (
                                <span className="free-batch"> Free</span>
                              ) : (
                                ""
                              )}{" "}
                              <p>{eachEvents.name}</p>
                            </div>
                            {!eachEvents?.isRegistered &&
                              state?.selectedFilter === "all_events" && (
                                <button
                                  className="event-card-btn"
                                  onClick={() => handleSignUp(eachEvents)}
                                >
                                  Sign up
                                </button>
                              )}
                            {state?.selectedFilter === "my_events" && (
                              <button
                                className="event-card-btn"
                                onClick={() => handleEventCancel(eachEvents)}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                          <div className="event-card-city">
                            <p className="event-city-name">
                              {" "}
                              {eachEvents.cityName}
                            </p>
                            <p>
                              {" "}
                              {getDifferenceInMinutes(eachEvents.startDate,eachEvents.endDate)}
                            </p>
                            <p>{`from ${moment(eachEvents.startDate).format( "HH:mm")} to 
                             ${moment(eachEvents.endDate).format("HH:mm" )}`}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  </div>
                ) : (
                  ""
                )}
              </div>
            );
          })}
        </div>
      </div>

      {state?.isSignUpModalOpen && (
        <ModalComponent
          title="Register for Event"
          isModalOpen={state.isSignUpModalOpen}
          renderItems={
            <>
              <h2>Register Confirmation</h2>
              <p>Are you sure you want to register for the event? </p>
              <div className="event-details-modal-wrapper">
                <figure className="modal-figure">
                  <img className="modal-img" src={eventIcon} alt="event" />
                </figure>
                <div className="divider-vertical" />
                <div className="modal-event-details">
                  <p>{state?.selectedEvent?.name}</p>
                  <p>{state?.selectedEvent?.isFree}</p>
                  <p>{state?.selectedEvent?.cityName}</p>
                  <p>
                    {moment(state.selectedEvent?.startDate).format(
                      "dddd,Do MMMM"
                    )}
                  </p>
                  <p>{state?.selectedEvent?.period}</p>
                </div>
              </div>

              <button className="modal-btn" onClick={handleEventConfirmation}>
                Confirm
              </button>
              <button className="modal-btn" onClick={closeSignUpModal}>
                Cancel
              </button>
            </>
          }
          onClose={closeSignUpModal}
        />
      )}
      
      <ToastContainer />
    </div>
  );
};

export default Events;