import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import HamburgerMenu from 'components/hamburger-menu/HamburgerMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from 'contexts/AuthContext';
import { useContext } from 'react';
import NavbarItems from 'components/navbar-items/NavbarItems';
import hotels from 'components/global-search-box/hotels.json'; // Import the JSON data

const GlobalNavbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const { propertyId } = useParams(); // Extract propertyId from the URL
  const [propertyTitle, setPropertyTitle] = useState('ABC PROP');

  const onHamburgerMenuToggle = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    if (propertyId) {
      const property = hotels.find(hotel => hotel.property_id === propertyId);
      if (property) {
        setPropertyTitle(property.title);
      }
    }
  }, [propertyId]);

  return (
    <div className="relative flex flex-wrap justify-between items-center px-4 md:px-12 global-navbar__container bg-brand brand-divider-bottom shadow-md">
      <div className="flex items-center">
        <Link to="/">
          <img src={""} alt="" className="" />
        </Link>
        <span className="ml-4 text-white text-2xl font-bold tracking-wide">{propertyTitle}</span>
      </div>
      <ul className="list-none hidden md:flex">
        <NavbarItems isAuthenticated={isAuthenticated} />
      </ul>
      <FontAwesomeIcon
        data-testid="menu-toggle__button"
        icon={faBars}
        size="2x"
        color="#fff"
        className="block md:hidden"
        onClick={onHamburgerMenuToggle}
      />
      <HamburgerMenu
        isVisible={isVisible}
        onHamburgerMenuToggle={onHamburgerMenuToggle}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default GlobalNavbar;
