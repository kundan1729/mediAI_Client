import { getAuthRole, getLandingPageForRole, isLoggedIn } from '../services/api';

const ProtectedRoute = ({ children, onRedirect, allowedRoles = [] }) => {
  if (!isLoggedIn()) {
    onRedirect('login');
    return null;
  }

  if (allowedRoles.length > 0) {
    const role = getAuthRole().toUpperCase();
    if (!allowedRoles.map((value) => value.toUpperCase()).includes(role)) {
      onRedirect(getLandingPageForRole(role));
      return null;
    }
  }

  return children;
};

export default ProtectedRoute;