import React from "react";
import "./MainNavigation.css";
import MainHeader from "./MainHeader";
import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";
import SideDrawer from "./SideDrawer";
import { useState } from "react";
import Backdrop from "../UIElements/Backdrop";

const MainNavigation =props =>{
    const [drawerIsOpen, setDrawerIsOpen] =useState(false);
    const switchDrawer =() =>{
        drawerIsOpen ? setDrawerIsOpen(false): setDrawerIsOpen(true);
    };

    return (<div>
       {drawerIsOpen ? <Backdrop onClick={switchDrawer} /> :null}
        <SideDrawer show={drawerIsOpen} onClick={switchDrawer}>
            <nav className="main-navigation__drawer-nav">
                <NavLinks/>
            </nav>
        </SideDrawer>
    <MainHeader>
        <button className="main-navigation__menu-btn" onClick={switchDrawer}>
            <span />
            <span />
            <span />
        </button>
        <h1 className="main-navigation__title">
            <Link to="/">Writer Helper</Link> 
        </h1>
        <nav className="main-navigation__header-nav">
            <NavLinks/>
        </nav>
    </MainHeader>
    </div>)
};

export default MainNavigation;