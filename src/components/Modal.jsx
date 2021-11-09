import React from 'react';
import './Modal.scss';


// { value: "15min", label: "15 минут", startTime: "07:00", endTime: "17:00" },

function Modal({addOption, display, setModal}) {
  const durationRef = React.useRef(null);
  const descriptionRef = React.useRef(null);
  const startRef = React.useRef(null);
  const endRef = React.useRef(null);
  const regex = /\b([01][0-9]|2[0-3]):([0-5][0-9])\b/
  function submit(e){
    e.preventDefault();
    if(!regex.test(startRef.current.value) || !regex.test(endRef.current.value)){
      alert("Введите время полностью (в формате 24:00)");
      return;
    } else if(!durationRef.current.value){
      alert("Введите длительность сеанса в минутах");
      return;
    } else if(!descriptionRef.current.value){
      alert("Введите название графика");
      return;
    }
    addOption({value: `${durationRef.current.value}min`, label: descriptionRef.current.value, startTime: startRef.current.value, endTime: endRef.current.value});
    setModal("none")
  }

  return (
    <div className="modal-container" style={{display}}>
      <span onClick={() => setModal("none")}>X</span>
      <form action="">
        <input ref={durationRef} type="number" placeholder="Сеанс в минутах"/>
        <input ref={descriptionRef} type="text" placeholder="Название графика"/>
        <input ref={startRef} type="time" placeholder="Начало дня"/>
        <input ref={endRef} type="time" placeholder="Конец дня"/>
        <button onClick={e => submit(e)}>Сохранить новый график</button>
      </form>
    </div>
  );
}

export default Modal;