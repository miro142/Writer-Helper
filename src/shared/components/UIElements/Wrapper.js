import React, { useState } from 'react';
import EditableCardList from './EditableCardList.js';
import { useHttpClient } from '../../hooks/http-hook';
import StoreApi from '../../util/storeApi.js';
import ElementInput from './ElementInput.js';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import ErrorModal from './ErrorModal.js';
import "./Wrapper.css"
import LoadingSpinner from './LoadingSpinner.js';

const Wrapper=props=> {
  const [data,setData]=useState(props.items);
  const {isLoading,setIsLoading, error, sendRequest, clearError}= useHttpClient();
  const addMoreList= async()=>{
    const newList={
      title: 'click to edit',
      items: [],
    };
    try{
      const resData =await sendRequest(`http://localhost:5000/api/${props.type}s/${props.id}/details/list`, "POST", JSON.stringify({
        list: newList,
      }),{'Content-Type':'application/json',
         Authorization: 'Bearer ' + props.auth.token
      });
      setData(resData.entity.details);
    }catch(err){}
  }
  const addMoreCard= async (listId)=>{
    const newCard = {
      title: "click to edit",
      description: "click to edit"
    };
    try{
      const resData =await sendRequest(`http://localhost:5000/api/${props.type}s/${props.id}/details/card`, "POST", JSON.stringify({
        listId: listId, card: newCard
      }),{'Content-Type':'application/json',
         Authorization: 'Bearer ' + props.auth.token
      });
      setData(resData.entity.details);
    }catch(err){}
  };
 const removeList=async (listId)=>{
  try{
    const resData =await sendRequest(`http://localhost:5000/api/${props.type}s/${props.id}/details/list`, "DELETE", JSON.stringify({
      listId: listId
    }),{'Content-Type':'application/json',
       Authorization: 'Bearer ' + props.auth.token
    });
    setData(resData.entity.details);
  }catch(err){}
 };
 const removeCard=async (listId, ID)=>{
  try{
    const resData =await sendRequest(`http://localhost:5000/api/${props.type}s/${props.id}/details/card`, "DELETE", JSON.stringify({
      listId: listId, cardId: ID
    }),{'Content-Type':'application/json',
       Authorization: 'Bearer ' + props.auth.token
    });
    setData(resData.entity.details);
  }catch(err){}
 };
  const updateTitle =async (title,ListID, type, ID)=>{
    if(title===""){title='\u00A0'}
    if(type==='list'){
      try{
        const resData =await sendRequest(`http://localhost:5000/api/${props.type}s/${props.id}/details/list`, "PATCH", JSON.stringify({
          listId: ListID, title: title
        }),{'Content-Type':'application/json',
           Authorization: 'Bearer ' + props.auth.token
        });
        setData(resData.entity.details);
      }catch(err){}
    } else if(type==='cardT'){
      try{
        const resData =await sendRequest(`http://localhost:5000/api/${props.type}s/${props.id}/details/card`, "PATCH", JSON.stringify({
          listId: ListID, cardId: ID, title: title
        }),{'Content-Type':'application/json',
           Authorization: 'Bearer ' + props.auth.token
        });
        setData(resData.entity.details);
      }catch(err){}
    }
    else if(type==='cardD'){
      try{
        const resData =await sendRequest(`http://localhost:5000/api/${props.type}s/${props.id}/details/card`, "PATCH", JSON.stringify({
          listId: ListID, cardId: ID, description: title 
        }),{'Content-Type':'application/json',
           Authorization: 'Bearer ' + props.auth.token
        });
        setData(resData.entity.details);
      }catch(err){}
    }
    
  };
  const onDragEnd= async (result)=>{
    const {destination,source, type}=result;
    if(!destination){
      return;
    }
    if(type==='list'){
      const newItems=Array.from(data);
      const [removed] = newItems.splice(source.index, 1);// removing the dragged item from the array
      newItems.splice(destination.index, 0, removed);//reinserting the dragged item back into the array to its new spot

    const updatedData = newItems.map((item) => item._id);
      try {
        await sendRequest(
          `http://localhost:5000/api/${props.type}s/${props.id}/details/list/order`,
          "PATCH",
          JSON.stringify({listIds:updatedData}),
          {
            "Content-Type": "application/json",
            Authorization: "Bearer " + props.auth.token,
          }
        );
        setData(newItems);
        setIsLoading(true);
      } catch (error) {
      }
      return;
    }
    else {
      const sourceListId = source.droppableId;
      const destinationListId = destination.droppableId;
      const sameList = sourceListId === destinationListId;
  
      if (sameList) {
        const updatedList = data.find((list) => list._id === sourceListId);
        const updatedCardOrder = Array.from(updatedList.items);
        const [movedCard] = updatedCardOrder.splice(source.index, 1);// removing the dragged item from the array
        updatedCardOrder.splice(destination.index, 0, movedCard);//reinserting the dragged item back into the array to its new spot
  
        try {
          await sendRequest(
            `http://localhost:5000/api/${props.type}s/${props.id}/details/card/order`,
            "PATCH",
            JSON.stringify({ listId: sourceListId, cardIds: updatedCardOrder.map((card) => card._id) }),
            {
              "Content-Type": "application/json",
              Authorization: "Bearer " + props.auth.token,
            }
          );
  
          const updatedData = data.map((list) => {
            if (list._id === sourceListId) {
              return { ...list, items: updatedCardOrder };
            }
            return list;
          });
  
          setData(updatedData);
        } catch (error) {
        }
      }
    }
  };
  
  return (
    <StoreApi.Provider value={{addMoreCard, addMoreList, updateTitle, removeList, removeCard}}>
      <ErrorModal error={error} onClear={clearError}/>
      {isLoading &&(<div className='center' ><LoadingSpinner asOverlay/></div>)}
        {!isLoading && <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="listSpace" type ="list" direction='horizontal'>
          {(provided)=>( 
        <div className='wrapper_main' ref={provided.innerRef} {...provided.droppableProps}>
          {data.map((list, index)=>{
            return <EditableCardList list={list} key={list.id} index={index}/>
          })}
          <ElementInput className='wrapper_plus' type='list'/>
          {provided.placeholder}
        </div>
          )}
        </Droppable>
      </DragDropContext>}
    </StoreApi.Provider>
    
  );
}

export default Wrapper;
