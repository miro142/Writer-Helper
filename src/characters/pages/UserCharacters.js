import React, { useEffect, useState, useContext } from 'react';
import { useHttpClient } from '../../shared/hooks/http-hook';
import CharacterList from '../components/CharacterList';
import { AuthContext } from '../../shared/context/auth-context';
import { useParams } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Button from '../../shared/components/FormElements/Button';
import SearchBox from '../../shared/components/UIElements/SearchBox';


const UserCharacters = () => {
  const auth = useContext(AuthContext);
  const [loadedCharacters, setLoadedCharacters]= useState();
  const [filteredCharacters, setFilteredCharacters] = useState();
  const {isLoading, error,sendRequest, clearError}= useHttpClient();
  const userId=useParams().userId;
  useEffect(()=>{
    const fetchCharacters = async ()=>{
      try{
        const resData = await sendRequest(`http://localhost:5000/api/characters/user/${userId}`);
        setLoadedCharacters(resData.characters);
        setFilteredCharacters(resData.characters);
      }catch(err){
    
      }
    }
    fetchCharacters();
  }, [sendRequest, userId]);
  const characterDeleteHandler=deletedCharacterId=>{
    setLoadedCharacters(prevCharacters=>prevCharacters.filter(character=>character.id!==deletedCharacterId));
    setFilteredCharacters(prevCharacters=>prevCharacters.filter(character=>character.id!==deletedCharacterId));
  };
  const searchHandler =(event)=>{
    setFilteredCharacters(loadedCharacters.filter(character=> character.title.toLowerCase().includes(event.target.value.toLowerCase())));
  };

  return <React.Fragment>
    <ErrorModal error={error} onClear={clearError}/>
    {isLoading &&(<div className='center' ><LoadingSpinner /></div>)}
    {!isLoading && auth.userID ===userId && <div className='center'> <Button to={"/characters/new"}>NEW CHARACTER</Button> </div>}
    {!isLoading && loadedCharacters&&<React.Fragment>
    <SearchBox type = "characters" onChange = {searchHandler}/>
    <CharacterList items={filteredCharacters} onDeleteCharacter= {characterDeleteHandler} />
    </React.Fragment>
    }
  </React.Fragment>
  
};

export default UserCharacters;