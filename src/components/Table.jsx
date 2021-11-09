import React from 'react';
import Select from "react-select";
import { useTable } from 'react-table';
import "./Table.scss";
import moment from 'moment';
import { timeFormat } from './../constants';
import { getAppointments } from '../functions';
// Имеется 3 (сервиса) графика работы у сотрудников мед. учреждения:
// C 08:00 – 17:00, продолжительность одного сеанса 30 минут.
// С 07:00 – 17:00, продолжительность одного сеанса 15 минут.
// С 09:00 – 17:00, продолжительность одного сеанса 1 час 15 минут.


// Также имеются следующие приёмы у врачей на:
// 08:15 начало, продолжительность 15 минут.
// 09:30 начало, продолжительность 30 минут.
// 11:30 начало, продолжительность 1 час 15 минут.

// Сгенерировать под каждый график работы таблицу, градация между ячейками соответственна продолжительности сеанса. 
// Пример: 
// 08:00 - 08:30            х
// 08:30 - 09:00            √
// 09:00 - 09:30            √
// 09:30 - 10:00            х
// 10:00- 10:30             √
// 10:30 - 11:00            √


// Таблица соответствует графику №1.
// Задание:
// Сделать селектор с возможностью выбора одного из трёх рабочих графиков.
// Сгенерировать таблицу, соответствующую рабочему графику.
// Забронировать ячейки в соответствии с записью на приём и рабочим графиком. Работать должно на всех трёх серверах.

function Table(props) {  
  const options = [
    { value: "15min", label: "15 минут", startTime: "07:00", endTime: "17:00" },
    { value: "30min", label: "30 минут", startTime: "08:00", endTime: "17:00" },
    { value: "75min", label: "1ч 15 минут", startTime: "09:00", endTime: "17:00" },
  ];

  const [schedule, setSchedule] = React.useState("");
  const [apointments, setApointments] = React.useState([]);
  React.useEffect(()=> {
    getAppointments().then(data => setApointments(data));
    // isVacant()
  }, [schedule]);

  const isVacant = (interval) => {
    let intervalStartTime = moment([interval.startTime.slice(0,2), interval.startTime.slice(2)], "HH:mm");
    let intervalEndTime = moment([interval.endTime.slice(0,2), interval.endTime.slice(2)], "HH:mm");
    const answer = apointments.some(({startTime, endTime}) => {
      startTime = moment([startTime.slice(0,2), startTime.slice(3)], "HH:mm");
      endTime = moment([endTime.slice(0,2), endTime.slice(3)], "HH:mm");
      console.log("startTime",startTime.format(timeFormat), "intervalStartTime", intervalStartTime.format(timeFormat), "endTime", endTime.format(timeFormat), "intervalEndTime", intervalEndTime.format(timeFormat))
      if(intervalStartTime.isSame(startTime) || intervalEndTime.isSame(endTime) || (startTime.isAfter(intervalStartTime) && endTime.isBefore(intervalEndTime)) || (intervalStartTime.isAfter(startTime) && intervalStartTime.isBefore(endTime))){
        return true
      } else return false
    })
    console.log(answer)
    return answer ? "X" : "✔"
  }

  const scheduleData = React.useMemo(() => {
    if(!schedule) return [];
    const scheduleNum = parseInt(schedule);
    const data = [];
    // const data = [{"sch": "08:30-09:00", "status": "✔"}, {"sch": "09:00-09:30", "status": "✕"}];
    let {startTime, endTime} = options.find((optionItem, index) => optionItem.value === schedule) || {};
    let startTimePlusInterval = moment([startTime.slice(0,2), startTime.slice(3)], "HHmm");
    startTime = moment([startTime.slice(0,2), startTime.slice(3)], "HHmm");
    endTime = moment([endTime.slice(0,2), endTime.slice(3)], "HHmm");
    while(startTime.isBefore(endTime)){
      startTimePlusInterval.add(scheduleNum, 'minutes');
      console.log(startTime)
      const status = isVacant({startTime: startTime.format("HHmm"), endTime: startTimePlusInterval.format("HHmm")})
      const sch = `${startTime.format(timeFormat)}-${startTime.add(scheduleNum, 'minutes'),startTime.format(timeFormat)}`
      data.push({sch, status})
    }
    return data
  }, [schedule])
  
  const columns = React.useMemo(() => [{Header: "Время", accessor: "sch"}, {Header: "Статус", accessor: "status"}], [])
  
  const tableInstance = useTable({ columns, data: scheduleData });

  const {getTableProps,getTableBodyProps,headerGroups,rows,prepareRow} = tableInstance;
 

  return (
    <div className="table-container">
      <div className="react-select-main-container">
        <Select onChange={function(e){setSchedule(e?.value ?? "")}} placeholder="Выберите график" classNamePrefix="select" className="basic-single" isClearable={true} isSearchable={true} options={options}/>
      </div>
      <table {...getTableProps()}>
        <thead>
          {// Loop over the header rows
          headerGroups.map(headerGroup => (
            // Apply the header row props
            <tr {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
              headerGroup.headers.map(column => (
                // Apply the header cell props
                <th {...column.getHeaderProps()}>
                  {// Render the header
                  column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {// Loop over the table rows
          rows.map(row => {
            // Prepare the row for display
            prepareRow(row)
            return (
              // Apply the row props
              <tr {...row.getRowProps()}>
                {// Loop over the rows cells
                row.cells.map(cell => {
                  // Apply the cell props
                  return (
                    <td {...cell.getCellProps()}>
                      {// Render the cell contents
                      cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

    </div>
  );
}

export default Table;
