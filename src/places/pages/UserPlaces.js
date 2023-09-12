import React, { useEffect, useState, useContext } from 'react';
import { useHttpClient } from '../../shared/hooks/http-hook';
import PlaceList from '../components/PlaceList';
import { AuthContext } from '../../shared/context/auth-context';
import { useParams } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Button from '../../shared/components/FormElements/Button';
import SearchBox from '../../shared/components/UIElements/SearchBox';


const UserPlaces = () => {
  const auth = useContext(AuthContext);
  const [loadedPlaces, setLoadedPlaces]= useState();
  const [filteredPlaces, setFilteredPlaces] = useState();
  const {isLoading, error,sendRequest, clearError}= useHttpClient();
  const userId=useParams().userId;

  useEffect(()=>{
    const fetchPlaces = async ()=>{
      try{
        const resData = await sendRequest(`http://localhost:5000/api/places/user/${userId}`);
        setLoadedPlaces(resData.places);
        setFilteredPlaces(resData.places);
      }catch(err){
    
      }
    }
    fetchPlaces();
  }, [sendRequest, userId]);
  const placeDeleteHandler=deletedPlaceId=>{
    setLoadedPlaces(prevPlaces=>prevPlaces.filter(place=>place.id!==deletedPlaceId));
    setFilteredPlaces(prevPlaces=>prevPlaces.filter(place=>place.id!==deletedPlaceId));
  };
  const searchHandler =(event)=>{
    setFilteredPlaces(loadedPlaces.filter(place=> place.title.toLowerCase().includes(event.target.value.toLowerCase())));
  };

  return <React.Fragment>
    <ErrorModal error={error} onClear={clearError}/>
    {isLoading &&(<div className='center' ><LoadingSpinner /></div>)}
    {!isLoading && auth.userID ===userId && <div className='center'> <Button to={"/places/new"}>NEW PLACE</Button> </div>}
    {!isLoading && loadedPlaces&&<React.Fragment>
    <SearchBox type = "places" onChange = {searchHandler}/>
    <PlaceList items={filteredPlaces} onDeletePlace= {placeDeleteHandler} />
    </React.Fragment>
    }
  </React.Fragment>
  
};

export default UserPlaces;
