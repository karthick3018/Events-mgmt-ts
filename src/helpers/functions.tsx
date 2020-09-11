import moment from 'moment';
import groupBy from "lodash/groupBy";
import map from "lodash/map";

interface ICities {
  id: number;
  name: string;
}

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

export const  getPeriod = (currentTime:Date):string=> {
  const splitMorning:number = 6; 
  const splitAfternoon:number = 12;  
  const splitEvening:number = 17;  
  const splitNight:number = 21;
  const currentHour:number = parseFloat(moment(currentTime).format('HH'));
   

  if (currentHour >= splitMorning && currentHour < splitAfternoon) {
    return 'morning'
  }
  else if(currentHour >= splitAfternoon && currentHour < splitEvening){
    return 'afternoon'
  } 
  else if (currentHour >= splitEvening && currentHour < splitNight) {
    return 'evening'
  }
  return 'night'
  
}

export const groupByDate = (cities:ICities[],events:IEventTypes[]) => {
  let newlyConstructedValue: IEventTypes[] = [];

  events.map((eachEvents:IEventTypes) => {
    let values:string='';
    cities.map((eachCities:ICities) => {
      if (eachEvents.city === eachCities.id) {
        values = eachCities.name;
      }
      return true;
    });
    let period = getPeriod(eachEvents.startDate);
    
    newlyConstructedValue.push({
      cityName: values,
      name: eachEvents.name,
      id: eachEvents.id,
      startDate: eachEvents.startDate,
      endDate: eachEvents.endDate,
      isFree: eachEvents.isFree,
      period, 
      city: eachEvents.city,
      isRegistered: false, 
    });
    return newlyConstructedValue;
  });

  var groups = groupBy(newlyConstructedValue, function (eachEvents) {
    return moment(eachEvents.startDate).startOf("day").format();
  });

  var groupedValues = map(groups, function (events, date) {
    return {
      date,
      events,
    };
  });
  return groupedValues
}

export const getDifferenceInMinutes = (startDate:Date,endDate:Date):string => {
  let differenceMinutes:number= (moment(startDate).diff(moment(endDate), 'minutes'))  ;
  return `${-differenceMinutes}'`
}