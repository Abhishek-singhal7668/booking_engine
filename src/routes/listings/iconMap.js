// iconMap.js
import { faBed, faWifi, faHamburger, faParking, faBath, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const iconMap = {
  'fa fa-bed': faBed,
  'fa fa-wifi': faWifi,
  'fas fa-hamburger': faHamburger,
  'fa fa-parking': faParking,
  'fa fa-bath': faBath,
  // Add other mappings as needed
};

export const getIcon = (iconText) => iconMap[iconText] || faQuestionCircle; // Default icon if not found
