import React from 'react';
import {BrowserRouter as Router,Routes, Route, Navigate} from 'react-router-dom';
import Users from './users/pages/users';
import Place from './places/pages/NewPlace';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './users/pages/Auth';
import {AuthContext} from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
import PlaceDetails from './places/pages/PlaceDetails';
import UserCharacters from './characters/pages/UserCharacters';
import NewCharacter from './characters/pages/NewCharacter';
import UserObjects from './Objects/pages/UserObjects';
import UserOrganizations from './Organizations/pages/UserOrganizations';
import UpdateCharacter from './characters/pages/UpdateCharacter';
import CharacterDetails from './characters/pages/CharacterDetails';
import NewObject from './Objects/pages/NewObject';
import ObjectDetails from './Objects/pages/ObjectDetails';
import UpdateObject from './Objects/pages/UpdateObject';
import NewOrganization from './Organizations/pages/NewOrganization';
import UpdateOrganization from './Organizations/pages/UpdateOrganization';
import OrganizationDetails from './Organizations/pages/OrganizationDetails';
import RelationshipWeb from './relations/pages/RelationshipWeb';

const App = ()=> {
  const {token, login, logout, userId}= useAuth();

  let routes;
  if(token){
    routes=(
      <React.Fragment>
      <Route exact path='/' element={<Users/>}/>
      <Route exact path="/:userId/places" element={<UserPlaces/>}/>
      <Route exact path="/:userId/characters" element={<UserCharacters/>}/>
      <Route exact path="/:userId/objects" element={<UserObjects/>}/>
      <Route exact path="/:userId/organizations" element={<UserOrganizations/>}/>
      <Route exact path='/places/new' element={<Place/>}/>
      <Route exact path="/places/:placeId" element={<UpdatePlace/>}/>
      <Route exact path="/places/details/:placeId" element={<PlaceDetails/>}/>
      <Route exact path='/characters/new' element={<NewCharacter/>}/>
      <Route exact path="/characters/:characterId" element={<UpdateCharacter/>}/>
      <Route exact path="/characters/details/:characterId" element={<CharacterDetails/>}/>
      <Route exact path='/objects/new' element={<NewObject/>}/>
      <Route exact path="/objects/:objectId" element={<UpdateObject/>}/>
      <Route exact path="/objects/details/:objectId" element={<ObjectDetails/>}/>
      <Route exact path='/organizations/new' element={<NewOrganization/>}/>
      <Route exact path="/organizations/:organizationId" element={<UpdateOrganization/>}/>
      <Route exact path="/organizations/details/:organizationId" element={<OrganizationDetails/>}/>
      <Route exact path="/:userId/relations" element={<RelationshipWeb/>}/>
      <Route
        path="*"
        element={<Navigate replace to="/" />}
      />
      </React.Fragment>
    );
  } else{
    routes=(
      <React.Fragment>
      <Route exact path='/' element={<Users/>}/>
      <Route exact path="/auth" element={<Auth/>}/>
      <Route
        path="*"
        element={<Navigate replace to="/auth" />}
      />
      </React.Fragment>
    );
  }

  return ( <AuthContext.Provider value={{isLoggedIn:!!token,token:token,userID: userId, login:login,logout:logout}}>
  <Router>
    <MainNavigation/>
    <main>
    <Routes>
    {routes}
    </Routes>
    </main>
  </Router>
  </AuthContext.Provider>);
}

export default App;
